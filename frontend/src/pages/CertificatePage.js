import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI, playSound } from '../api';
import '../styles/CertificatePage.css';

/**
 * Certificate Page Component
 * Handles certificate registration and display
 * First time: asks for full name and shows certificate
 * Next times: shows certificate and download button
 * User clicks button to download (no auto-download)
 */
function CertificatePage() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkCertificateStatus();
  }, []);

  const checkCertificateStatus = async () => {
    try {
      const result = await gameAPI.checkIfCertificateExists();
      
      if (result.exists) {
        // Certificate already exists - fetch and display it
        const certData = await gameAPI.getCertifiedData();
        console.log(certData)
        setCertificateData(certData);
        setFullName(certData.certificate_name);
        setShowModal(false);
      } else {
        // No certificate - show modal for name entry
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error checking certificate status:', err);
      setError('Error checking certificate status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitName = async (e) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register certificate (backend stores the name)
      const response = await gameAPI.registerCertificate(fullName);
      playSound('success');
      
      // Store certificate data and extract fullName from response
      setCertificateData(response);
      setFullName(response.certificate_name);
      setShowModal(false);
    } catch (err) {
      console.error('Error registering certificate:', err);
      setError(err.message || 'Failed to register certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    console.log("fullName", fullName);
    if (!fullName) {
      setError('Certificate name not available');
      return;
    }

    try {
      // Create certificate HTML
      const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Toxic Turtle Certificate</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
              font-family: 'Times New Roman', serif;
            }
            .certificate {
              width: 800px;
              height: 600px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: 10px solid #d4af37;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 50px rgba(0,0,0,0.3);
              text-align: center;
              color: white;
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: relative;
            }
            .certificate::before {
              content: '🐢';
              font-size: 80px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 48px;
              margin: 10px 0;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            h2 {
              font-size: 36px;
              margin: 20px 0;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            p {
              font-size: 20px;
              margin: 10px 0;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            .name {
              font-size: 32px;
              font-weight: bold;
              margin: 30px 0;
              border-bottom: 3px solid #d4af37;
              padding-bottom: 10px;
            }
            .date {
              font-size: 16px;
              margin-top: 40px;
            }
            .seal {
              position: absolute;
              bottom: 30px;
              right: 30px;
              font-size: 40px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>Certificate of Achievement</h1>
            <h2>Toxic Turtle Game</h2>
            <p>This is to certify that</p>
            <div class="name">${fullName}</div>
            <p>has successfully completed all levels of the Toxic Turtle educational game and demonstrated mastery of programming fundamentals.</p>
            <p class="date">Date: ${new Date().toLocaleDateString()}</p>
            <div class="seal">🏆</div>
          </div>
        </body>
        </html>
      `;

      // Download certificate only when user clicks button (not automatic)
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Toxic_Turtle_Certificate_${fullName.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      setError('Error downloading certificate');
    }
  };

  const handleReturnHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="certificate-page">
        <div className="certificate-container">
          <p>Loading certificate status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-container">
        {/* Header */}
        <div className="cert-header">
          <h1>🏆 Congratulations!</h1>
          <button className="btn-secondary btn-small" onClick={handleReturnHome}>
            ← Home
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {/* Certificate Registration Modal (First Time Only) */}
        {showModal && !certificateData && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>🎓 Claim Your Certificate</h2>
              <p>You've completed all levels! Enter your full name to generate your certificate.</p>

              <form onSubmit={handleSubmitName}>
                <div className="form-group">
                  <label htmlFor="fullName">Your Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn-success btn-large" disabled={loading}>
                  {loading ? 'Generating Certificate...' : 'Generate Certificate'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Certificate Preview and Download Button */}
        {certificateData && (
          <div className="certificate-content">
            <h2>✨ Your Certificate of Achievement</h2>
            
            <div className="certificate-preview">
              <div className="certificate-box">
                <div className="certificate-inner">
                  <h3>🐢 Certificate of Achievement</h3>
                  <h4>Toxic Turtle Game</h4>
                  <p>This is to certify that</p>
                  <div className="name-display">{fullName}</div>
                  <p>has successfully completed all levels of the Toxic Turtle educational game and demonstrated mastery of programming fundamentals.</p>
                  <p className="date-display">Date: {new Date().toLocaleDateString()}</p>
                  <div className="seal-display">🏆</div>
                </div>
              </div>
            </div>

            <div className="certificate-actions">
              <button 
                className="btn-success btn-large"
                onClick={handleDownloadCertificate}
              >
                📥 Download Certificate
              </button>
              <button 
                className="btn-secondary btn-large"
                onClick={handleReturnHome}
              >
                🏠 Return to Home
              </button>
            </div>

            <div className="achievement-box">
              <p>✅ All Levels Completed</p>
              <p>✅ Certificate Generated</p>
              <p>📥 Ready for Download</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CertificatePage;
