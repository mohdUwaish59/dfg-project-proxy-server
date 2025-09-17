function renderHomePage() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>oTree Proxy Server</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        .hero {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          padding: 0 20px;
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          background: linear-gradient(45deg, #fff, #e0e6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero p {
          font-size: 1.3rem;
          margin-bottom: 40px;
          opacity: 0.9;
          line-height: 1.6;
        }
        .cta-button {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 18px 40px;
          border: none;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 15px 35px rgba(17, 153, 142, 0.3);
          position: relative;
          overflow: hidden;
        }
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(17, 153, 142, 0.4);
        }
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .cta-button:hover::before {
          left: 100%;
        }
        .features {
          background: white;
          padding: 80px 20px;
        }
        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .features h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 60px;
          color: #333;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }
        .feature-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 40px 30px;
          border-radius: 20px;
          text-align: center;
          border: 2px solid #e1e5e9;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border-color: #667eea;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .feature-icon {
          font-size: 3rem;
          color: #667eea;
          margin-bottom: 20px;
        }
        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #333;
        }
        .feature-card p {
          color: #666;
          line-height: 1.6;
        }
        .footer {
          background: #2c3e50;
          color: white;
          text-align: center;
          padding: 40px 20px;
        }
        .footer p {
          opacity: 0.8;
        }
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }
          .hero p {
            font-size: 1.1rem;
          }
          .features h2 {
            font-size: 2rem;
          }
        }
      </style>
    </head>
    <body>
      <section class="hero">
        <div class="hero-content">
          <h1>
            <i class="fas fa-link"></i>
            oTree Proxy Server
          </h1>
          <p>
            Professional link management system for research experiments.
            <br>Create secure, one-time use links for your oTree studies.
          </p>
          <a href="/admin" class="cta-button">
            <i class="fas fa-cog"></i> Admin Dashboard
          </a>
          <a href="/api" class="cta-button" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <i class="fas fa-code"></i> API Documentation
          </a>
        </div>
      </section>
      
      <section class="features">
        <div class="features-container">
          <h2>Key Features</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h3>Secure Access</h3>
              <p>Each link is unique and can only be used once per participant, ensuring data integrity and preventing duplicate entries in your experiments.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-users"></i>
              </div>
              <h3>Group Management</h3>
              <p>Organize participants into groups with customizable limits. Perfect for multi-player experiments and controlled studies.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <h3>Real-time Analytics</h3>
              <p>Monitor participation rates, track link usage, and get insights into your experiment progress with our comprehensive dashboard.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-flask"></i>
              </div>
              <h3>oTree Integration</h3>
              <p>Specifically designed for oTree experiments with seamless integration and researcher-friendly features.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-mobile-alt"></i>
              </div>
              <h3>Mobile Friendly</h3>
              <p>Beautiful, responsive design that works perfectly on all devices - desktop, tablet, and mobile.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-cogs"></i>
              </div>
              <h3>Easy Setup</h3>
              <p>Quick deployment with minimal configuration. Get your experiment links running in minutes, not hours.</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer class="footer">
        <p>
          <i class="fas fa-code"></i> 
          Built for researchers, by researchers. 
          <br>
          <small>Open source proxy server for academic research.</small>
        </p>
      </footer>
    </body>
    </html>
  `;
}

module.exports = {
  renderHomePage
};