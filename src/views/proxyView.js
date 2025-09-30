function renderLinkNotFound() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Link Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-error-50 via-white to-warning-50 flex items-center justify-center p-4">
        <div class="w-full max-w-lg">
            <div class="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-lg overflow-hidden">
                <div class="text-center space-y-4 p-8 pb-8">
                    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-error-100 to-error-200">
                        <svg class="h-8 w-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    
                    <h1 class="text-2xl font-bold text-gray-900">
                        Link Not Found
                    </h1>
                    
                    <p class="text-base text-gray-600">
                        The requested experiment link does not exist or has been deactivated.
                    </p>
                </div>
                
                <div class="p-8 space-y-6">
                    <a href="/" class="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-md font-semibold transition-all duration-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        Return Home
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

function renderExperimentFull(link) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Experiment Full - ${link.group_name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-warning-50 via-white to-error-50 flex items-center justify-center p-4">
        <div class="w-full max-w-lg">
            <div class="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-lg overflow-hidden">
                <div class="text-center space-y-4 p-8 pb-8">
                    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-warning-100 to-warning-200">
                        <svg class="h-8 w-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    
                    <div class="mx-auto px-4 py-2 border border-primary-200 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                        <svg class="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        ${link.group_name || 'Experiment Group'}
                    </div>
                    
                    <h1 class="text-2xl font-bold text-gray-900">
                        Experiment Full
                    </h1>
                    
                    <p class="text-base text-gray-600">
                        This experiment group is already full. All ${link.max_uses} participants have joined.
                    </p>
                </div>
                
                <div class="p-8 space-y-6">
                    <div class="bg-warning-50 border border-warning-200 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <svg class="h-4 w-4 text-warning-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                            <div class="text-sm text-warning-800">
                                Please contact the administrator if you need access to this experiment.
                            </div>
                        </div>
                    </div>
                    
                    <a href="/" class="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-md font-semibold transition-all duration-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        Return Home
                    </a>
                </div>
            </div>
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
    <html lang="en">
    <head>
      <title>oTree Experiment - ${link.group_name}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary: {
                  50: '#f0f9ff',
                  100: '#e0f2fe',
                  500: '#0ea5e9',
                  600: '#0284c7',
                  700: '#0369a1',
                },
                success: {
                  50: '#f0fdf4',
                  100: '#dcfce7',
                  500: '#22c55e',
                  600: '#16a34a',
                  700: '#15803d',
                },
                warning: {
                  50: '#fffbeb',
                  100: '#fef3c7',
                  500: '#f59e0b',
                  600: '#d97706',
                  700: '#b45309',
                },
                accent: {
                  50: '#f0fdf4',
                  100: '#dcfce7',
                  500: '#10b981',
                  600: '#059669',
                },
              },
            }
          }
        }
      </script>
      <style>
        .btn-primary {
          @apply bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-md font-semibold transition-all duration-300 hover:shadow-lg;
        }
      </style>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl">
        <div class="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-lg overflow-hidden">
          <div class="text-center space-y-4 p-8 pb-8">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-accent-600">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z"></path>
              </svg>
            </div>
            
            <div class="mx-auto px-4 py-2 border border-primary-200 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              <svg class="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              ${link.group_name || 'Experiment Group'}
            </div>
            
            <h1 class="text-3xl font-bold text-gray-900">
              Welcome to the Research Experiment
            </h1>
            
            <p class="text-base text-gray-600">
              Click the button below to join your assigned experiment session
            </p>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gradient-to-br from-success-50 to-success-100 border-0 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-success-600 mb-2">
                  ${remainingSpots}
                </div>
                <div class="text-sm text-success-700/70">
                  Spots Remaining
                </div>
              </div>
              
              <div class="bg-gradient-to-br from-primary-50 to-primary-100 border-0 rounded-lg p-6 text-center">
                <div class="text-3xl font-bold text-primary-600 mb-2">
                  ${link.max_uses}
                </div>
                <div class="text-sm text-primary-700/70">
                  Total Participants
                </div>
              </div>
            </div>
            
            <button onclick="joinExperiment()" class="w-full bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white px-8 py-4 rounded-md font-semibold transition-all duration-300 h-14 text-lg" id="joinBtn">
              <svg class="mr-2 h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M5 12h14l-1 7H6l-1-7z"></path>
              </svg>
              Join Experiment
            </button>
            
            <div class="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="h-4 w-4 text-warning-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div class="text-sm text-warning-800">
                  <strong>Important:</strong> You can only join once. ${remainingSpots} spots remaining in this group.
                  The experiment will open in a new tab.
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <svg class="h-4 w-4 flex-shrink-0 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span class="font-mono break-all">
                  Destination: ${link.real_url}
                </span>
              </div>
            </div>
          </div>
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
            hash = hash & hash;
          }
          return Math.abs(hash).toString(36);
        }

        async function joinExperiment() {
          const button = document.getElementById('joinBtn');
          const originalText = button.innerHTML;
          const fingerprint = generateFingerprint();
          
          // Show loading state
          button.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Joining...';
          button.disabled = true;
          
          try {
            const response = await fetch('/proxy/${proxyId}/use', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fingerprint: fingerprint })
            });
            
            const data = await response.json();
            
            if (data.success) {
              button.innerHTML = '<svg class="mr-2 h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Opening Experiment...';
              
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
              
              // Open the experiment in a new tab
              window.open('${link.real_url}', '_blank');
              
              // Update the page
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              throw new Error(data.error || 'Failed to join experiment');
            }
          } catch (error) {
            console.error('Error joining experiment:', error);
            alert('Failed to join experiment: ' + error.message);
            button.innerHTML = originalText;
            button.disabled = false;
          }
        }
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