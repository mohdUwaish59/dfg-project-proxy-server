function renderLinkNotFound() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Link Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            ${getBaseStyles()}
            body { 
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            }
            .error-icon {
                font-size: 4rem;
                color: #ff6b6b;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Link Not Found</h1>
            <p>The requested experiment link does not exist or has been deactivated.</p>
        </div>
    </body>
    </html>
  `;
}

function renderExperimentFull(link) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Experiment Full - ${link.group_name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            ${getBaseStyles()}
            body { 
                background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%);
            }
            .full-icon {
                font-size: 4rem;
                color: #ffa502;
                margin-bottom: 20px;
            }
            .group-badge {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: 600;
                margin-bottom: 20px;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="full-icon">
                <i class="fas fa-users"></i>
            </div>
            <div class="group-badge">
                <i class="fas fa-tag"></i> ${link.group_name || 'Experiment Group'}
            </div>
            <h1>Experiment Full</h1>
            <p>This experiment group is already full. All ${link.max_uses} participants have joined.</p>
            <p style="margin-top: 20px; font-size: 0.9rem; color: #999;">
                Please contact the administrator if you need access.
            </p>
        </div>
    </body>
    </html>
  `;
}

function renderAlreadyParticipated(link, usage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Already Participated - ${link.group_name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            ${getBaseStyles()}
            body { 
                background: linear-gradient(135deg, #3742fa 0%, #2f3542 100%);
            }
            .check-icon {
                font-size: 4rem;
                color: #3742fa;
                margin-bottom: 20px;
            }
            .group-badge {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: 600;
                margin-bottom: 20px;
                display: inline-block;
            }
            .participant-badge {
                background: #e7f3ff;
                color: #3742fa;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                margin: 15px 0;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="check-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="group-badge">
                <i class="fas fa-tag"></i> ${link.group_name || 'Experiment Group'}
            </div>
            <h1>Already Participated</h1>
            <p>You have already joined this experiment group.</p>
            <div class="participant-badge">
                <i class="fas fa-user"></i> Participant #${usage.participant_number}
            </div>
            <p style="font-size: 0.9rem; color: #999;">
                Joined on: ${new Date(usage.used_at).toLocaleString()}
            </p>
        </div>
    </body>
    </html>
  `;
}

function renderJoinPage(link, remainingSpots, proxyId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>oTree Experiment - ${link.group_name}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
          ${getBaseStyles()}
          ${getJoinPageStyles()}
      </style>
    </head>
    <body>
      <div class="container">
          <div class="welcome-icon">
              <i class="fas fa-flask"></i>
          </div>
          
          <div class="group-header">
              <i class="fas fa-users"></i> ${link.group_name || 'Experiment Group'}
          </div>
          
          <h1>Welcome to the Research Experiment</h1>
          
          <div class="info-grid">
              <div class="info-item">
                  <div class="info-number">${remainingSpots}</div>
                  <div class="info-label">Spots Remaining</div>
              </div>
              <div class="info-item">
                  <div class="info-number">${link.max_uses}</div>
                  <div class="info-label">Total Participants</div>
              </div>
          </div>
          
          <p style="color: #666; font-size: 1.1rem; margin-bottom: 20px;">
              Click the button below to join your assigned experiment session.
          </p>
          
          <button class="join-button" onclick="joinExperiment()">
              <i class="fas fa-play"></i> Join Experiment
          </button>
          
          <div class="warning">
              <i class="fas fa-exclamation-circle"></i>
              <strong>Important:</strong> You can only join once. ${remainingSpots} spots remaining in this group.
              <br><small style="margin-top: 10px; display: block;">The experiment will open in a new tab.</small>
          </div>
          
          <div class="url-preview">
              <i class="fas fa-link"></i> Destination: ${link.real_url}
          </div>
      </div>
      
      <script>
        // Generate browser fingerprint
        function generateFingerprint() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Browser fingerprint', 2, 2);
          
          const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage,
            canvas.toDataURL(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.platform
          ];
          
          // Simple hash function
          let hash = 0;
          const str = components.join('|');
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
          }
          return Math.abs(hash).toString(36);
        }

        // Check if user already participated
        async function checkExistingParticipation() {
          const fingerprint = generateFingerprint();
          const groupId = '${proxyId}';
          
          // Check cookie first (faster)
          const cookieName = \`study_group_\${groupId}_fp\`;
          const storedFingerprint = document.cookie
            .split('; ')
            .find(row => row.startsWith(cookieName + '='))
            ?.split('=')[1];
          
          // Check localStorage
          const localStorageKey = \`study_access_\${groupId}\`;
          const localStorageData = localStorage.getItem(localStorageKey);
          
          if (storedFingerprint === fingerprint || localStorageData === fingerprint) {
            // User already participated, check with server
            try {
              const response = await fetch('/proxy/${proxyId}/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fingerprint: fingerprint })
              });
              
              const data = await response.json();
              if (data.alreadyParticipated) {
                // Replace the page content with "Already Participated" view
                showAlreadyParticipated(data.usage, data.link);
                return true;
              }
            } catch (error) {
              console.error('Error checking participation:', error);
            }
          }
          
          // Also check with server even if no local storage (in case user cleared storage)
          try {
            const response = await fetch('/proxy/${proxyId}/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fingerprint: fingerprint })
            });
            
            const data = await response.json();
            if (data.alreadyParticipated) {
              // Store in local storage and cookie for future checks
              document.cookie = \`\${cookieName}=\${fingerprint}; expires=\${new Date(Date.now() + 30*24*60*60*1000).toUTCString()}; path=/\`;
              localStorage.setItem(localStorageKey, fingerprint);
              
              showAlreadyParticipated(data.usage, data.link);
              return true;
            }
          } catch (error) {
            console.error('Error checking participation with server:', error);
          }
          
          return false;
        }

        function showAlreadyParticipated(usage, link) {
          const container = document.querySelector('.container');
          const joinDate = new Date(usage.used_at).toLocaleString();
          
          container.innerHTML = \`
            <div class="check-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="group-badge">
                <i class="fas fa-tag"></i> \${link.group_name || 'Experiment Group'}
            </div>
            <h1>Already Participated</h1>
            <p>You have already joined this experiment group.</p>
            <div class="participant-badge">
                <i class="fas fa-user"></i> Participant #\${usage.participant_number}
            </div>
            <p style="font-size: 0.9rem; color: #999;">
                Joined on: \${joinDate}
            </p>
          \`;
          
          // Update page styles
          document.body.style.background = 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)';
        }

        async function joinExperiment() {
          // Check if user already participated
          if (await checkExistingParticipation()) {
            return;
          }
          
          const button = document.querySelector('.join-button');
          const originalText = button.innerHTML;
          const fingerprint = generateFingerprint();
          
          // Show loading state
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
          button.disabled = true;
          
          try {
            const response = await fetch('/proxy/${proxyId}/use', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fingerprint: fingerprint })
            });
            
            const data = await response.json();
            
            if (data.success) {
              console.log('Participant registered successfully');
              button.innerHTML = '<i class="fas fa-check"></i> Opening Experiment...';
              
              // Store fingerprint to prevent re-participation
              const groupId = '${proxyId}';
              const cookieName = \`study_group_\${groupId}_fp\`;
              const localStorageKey = \`study_access_\${groupId}\`;
              
              // Set cookie (expires in 30 days)
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 30);
              document.cookie = \`\${cookieName}=\${fingerprint}; expires=\${expiryDate.toUTCString()}; path=/\`;
              
              // Set localStorage
              localStorage.setItem(localStorageKey, fingerprint);
              
              // Open the experiment in a new tab after successful registration
              window.open('${link.real_url}', '_blank');
              
              // Update the page to show success state
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              throw new Error(data.error || 'Failed to join experiment');
            }
          } catch (error) {
            console.error('Error joining experiment:', error);
            button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error - Try Again';
            button.disabled = false;
            
            // Reset button after 3 seconds
            setTimeout(() => {
              button.innerHTML = originalText;
            }, 3000);
          }
        }

        // Add CSS for already participated view
        function addAlreadyParticipatedStyles() {
          const style = document.createElement('style');
          style.textContent = \`
            .check-icon {
                font-size: 4rem;
                color: #3742fa;
                margin-bottom: 20px;
            }
            .group-badge {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: 600;
                margin-bottom: 20px;
                display: inline-block;
            }
            .participant-badge {
                background: #e7f3ff;
                color: #3742fa;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                margin: 15px 0;
                display: inline-block;
            }
          \`;
          document.head.appendChild(style);
        }

        // Check on page load
        document.addEventListener('DOMContentLoaded', async function() {
          addAlreadyParticipatedStyles();
          await checkExistingParticipation();
        });
      </script>
    </body>
    </html>
  `;
}

function getBaseStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: 'Inter', sans-serif; 
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
    }
    .container {
        background: white;
        padding: 50px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        text-align: center;
        max-width: 500px;
        width: 90%;
    }
    h1 { color: #333; margin-bottom: 15px; }
    p { color: #666; font-size: 1.1rem; }
  `;
}

function getJoinPageStyles() {
  return `
    body { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        animation: fadeIn 0.8s ease-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .container {
        max-width: 600px;
        position: relative;
        overflow: hidden;
    }
    .container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .welcome-icon {
        font-size: 4rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
    }
    .group-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 1.2rem;
        margin-bottom: 30px;
        display: inline-block;
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }
    h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 20px;
    }
    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 30px 0;
        padding: 25px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
        border: 1px solid #e1e5e9;
    }
    .info-item {
        text-align: center;
    }
    .info-number {
        font-size: 2rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 5px;
    }
    .info-label {
        color: #6c757d;
        font-weight: 500;
        font-size: 0.9rem;
    }
    .join-button {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        padding: 20px 40px;
        border: none;
        border-radius: 50px;
        font-size: 1.3rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        margin: 30px 0;
        transition: all 0.3s ease;
        box-shadow: 0 15px 35px rgba(17, 153, 142, 0.3);
        position: relative;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
    }
    .join-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
    .join-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 20px 40px rgba(17, 153, 142, 0.4);
    }
    .join-button:active {
        transform: translateY(-1px);
    }
    .join-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
    }
    .join-button:hover::before {
        left: 100%;
    }
    .warning {
        background: #fff3cd;
        border: 2px solid #ffeaa7;
        color: #856404;
        padding: 20px;
        border-radius: 15px;
        margin-top: 30px;
        font-weight: 500;
    }
    .url-preview {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #e1e5e9;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        color: #495057;
        margin-top: 20px;
        word-break: break-all;
    }
    @media (max-width: 768px) {
        .container { padding: 30px 25px; }
        .info-grid { grid-template-columns: 1fr; gap: 15px; }
        h1 { font-size: 1.5rem; }
    }
  `;
}

module.exports = {
  renderLinkNotFound,
  renderExperimentFull,
  renderAlreadyParticipated,
  renderJoinPage
};