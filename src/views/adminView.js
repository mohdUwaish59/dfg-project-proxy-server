http://localhost:3000/proxy/bae5e2661f441c7e05abbada0417bcbbconst { sanitizeInput } = require('../utils');

function renderAdminPage(isLoggedIn) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>oTree Proxy Server Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            ${getAdminStyles()}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-link"></i> oTree Proxy Manager</h1>
                <p>Professional Link Management for Research Experiments</p>
                ${isLoggedIn ? '<button onclick="logout()" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>' : ''}
            </div>
            
            ${isLoggedIn ? renderDashboard() : renderLoginForm()}
        </div>
        
        <script>
            ${getAdminJavaScript()}
        </script>
    </body>
    </html>
  `;
}

function renderDashboard() {
    return `
    <div class="stats-grid" id="stats-grid">
        <!-- Stats will be loaded here -->
    </div>
    
    <div class="card">
        <h2 style="margin-bottom: 25px; color: #333;">
            <i class="fas fa-plus-circle" style="color: #667eea;"></i> 
            Create New Experiment Link
        </h2>
        <form action="/admin/create-link" method="POST">
            <div style="display: grid; grid-template-columns: 1fr 2fr 100px; gap: 20px; align-items: end;">
                <div class="form-group">
                    <label><i class="fas fa-users"></i> Group Name</label>
                    <input type="text" name="groupName" class="form-control" placeholder="e.g., Group-1" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-external-link-alt"></i> oTree Experiment URL</label>
                    <input type="url" name="realUrl" class="form-control" placeholder="https://your-otree-server.com/room/..." required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-magic"></i> Create
                    </button>
                </div>
            </div>
        </form>
    </div>
    
    <div class="card">
        <h2 style="margin-bottom: 25px; color: #333;">
            <i class="fas fa-list"></i> 
            Experiment Links
        </h2>
        <div class="table-container">
            <table class="links-table" id="links-table">
                <thead>
                    <tr>
                        <th><i class="fas fa-users"></i> Group</th>
                        <th><i class="fas fa-link"></i> Proxy Link</th>
                        <th><i class="fas fa-chart-bar"></i> Usage</th>
                        <th><i class="fas fa-info-circle"></i> Status</th>
                        <th><i class="fas fa-calendar"></i> Created</th>
                        <th><i class="fas fa-cogs"></i> Actions</th>
                    </tr>
                </thead>
                <tbody id="links-tbody">
                    <!-- Links will be loaded here -->
                </tbody>
            </table>
            <div class="empty-state" id="empty-state" style="display: none;">
                <i class="fas fa-inbox"></i>
                <h3>No experiment links yet</h3>
                <p>Create your first experiment link using the form above.</p>
            </div>
        </div>
    </div>
  `;
}

function renderLoginForm() {
    return `
    <div class="login-card card">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-lock" style="font-size: 32px; color: white;"></i>
            </div>
            <h2 style="color: #333; margin-bottom: 10px;">Admin Access</h2>
            <p style="color: #6c757d;">Please login to manage experiment links</p>
        </div>
        
        <form action="/admin/login" method="POST">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Username</label>
                <input type="text" name="username" class="form-control" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-key"></i> Password</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
        </form>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <small style="color: #6c757d;">
                <i class="fas fa-info-circle"></i> 
                Default: <strong>admin</strong> / <strong>admin123</strong>
            </small>
        </div>
    </div>
  `;
}

function getAdminStyles() {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: 'Inter', sans-serif; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: #333;
    }
    .container { 
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 20px;
    }
    .header {
        text-align: center;
        margin-bottom: 40px;
        color: white;
        position: relative;
    }
    .header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .header p {
        font-size: 1.1rem;
        opacity: 0.9;
    }
    .logout-btn {
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .logout-btn:hover {
        background: rgba(255,255,255,0.3);
    }
    .card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        backdrop-filter: blur(10px);
    }
    .login-card {
        max-width: 400px;
        margin: 100px auto;
    }
    .form-group { 
        margin: 20px 0; 
    }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
    }
    .form-control {
        width: 100%;
        padding: 15px 20px;
        border: 2px solid #e1e5e9;
        border-radius: 12px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: #f8f9fa;
    }
    .form-control:focus {
        outline: none;
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .btn {
        padding: 15px 30px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        text-align: center;
    }
    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }
    .btn-success {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
    }
    .btn-danger {
        background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
        color: white;
    }
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    .table-container {
        margin-top: 20px;
        overflow-x: auto;
        border-radius: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .links-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .links-table thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    .links-table th {
        padding: 18px 16px;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: none;
    }
    .links-table th i {
        margin-right: 8px;
        opacity: 0.9;
    }
    .links-table tbody tr {
        border-bottom: 1px solid #f1f5f9;
        transition: all 0.2s ease;
    }
    .links-table tbody tr:hover {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        transform: scale(1.01);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .links-table tbody tr:last-child {
        border-bottom: none;
    }
    .links-table td {
        padding: 20px 16px;
        vertical-align: middle;
        border: none;
    }
    .group-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
    }
    .proxy-link-cell {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #4a5568;
        background: #f7fafc;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        position: relative;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .copy-btn-table {
        background: #667eea;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        margin-left: 8px;
        transition: all 0.2s ease;
    }
    .copy-btn-table:hover {
        background: #5a67d8;
        transform: translateY(-1px);
    }
    .usage-cell {
        min-width: 120px;
    }
    .usage-stats-table {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .usage-numbers {
        font-weight: 600;
        color: #2d3748;
        font-size: 14px;
    }
    .usage-progress-table {
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
    }
    .usage-fill-table {
        height: 100%;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        transition: width 0.3s ease;
        border-radius: 3px;
    }
    .usage-fill-table.full {
        background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
    }
    .actions-cell {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        min-width: 180px;
    }
    .btn-table {
        padding: 6px 12px;
        border: none;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
    }
    .btn-table:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    .btn-table.btn-copy {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
    }
    .btn-table.btn-copy:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    }
    .btn-table.btn-delete {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
    }
    .btn-table.btn-delete:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    }
    .created-date {
        font-size: 13px;
        color: #6b7280;
        white-space: nowrap;
    }
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
    }
    .empty-state i {
        font-size: 3rem;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    .empty-state h3 {
        margin-bottom: 8px;
        color: #374151;
    }
    .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .status-active { background: #d4edda; color: #155724; }
    .status-full { background: #f8d7da; color: #721c24; }
    .status-inactive { background: #d1ecf1; color: #0c5460; }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    .stat-card {
        background: white;
        padding: 25px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }
    .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 10px;
    }
    .stat-label {
        color: #6c757d;
        font-weight: 500;
    }
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        max-width: 350px;
    }
    .toast.show {
        transform: translateX(0);
    }
    .toast-error {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }
    .toast-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    .toast-info {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    @media (max-width: 768px) {
        .header h1 {
            font-size: 2rem;
        }
        .table-container {
            margin: 0 -15px;
            border-radius: 0;
        }
        .links-table {
            font-size: 13px;
        }
        .links-table th,
        .links-table td {
            padding: 12px 8px;
        }
        .proxy-link-cell {
            max-width: 150px;
            font-size: 11px;
        }
        .group-badge {
            font-size: 11px;
            padding: 6px 10px;
        }
        .actions-cell {
            flex-direction: column;
            gap: 4px;
            min-width: 100px;
        }
        .btn-table {
            font-size: 10px;
            padding: 4px 8px;
            justify-content: center;
        }
        .usage-cell {
            min-width: 80px;
        }
        .created-date {
            font-size: 11px;
        }
        /* Hide some columns on very small screens */
        .links-table th:nth-child(5),
        .links-table td:nth-child(5) {
            display: none;
        }
    }
    @media (max-width: 480px) {
        .links-table th:nth-child(2),
        .links-table td:nth-child(2) {
            display: none;
        }
        .links-table th:nth-child(4),
        .links-table td:nth-child(4) {
            display: none;
        }
    }
  `;
}

function getAdminJavaScript() {
    return `
    // Load stats and links
    Promise.all([
        fetch('/admin/links').then(r => r.json()),
        fetch('/admin/stats').then(r => r.json())
    ]).then(([links, stats]) => {
        renderStats(stats);
        renderLinks(links);
    });
    
    function renderStats(stats) {
        const statsGrid = document.getElementById('stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = \`
                <div class="stat-card">
                    <div class="stat-number">\${stats.total}</div>
                    <div class="stat-label">Total Groups</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.active}</div>
                    <div class="stat-label">Active Groups</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.participants}</div>
                    <div class="stat-label">Total Participants</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.full}</div>
                    <div class="stat-label">Completed Groups</div>
                </div>
            \`;
        }
    }
    
    function renderLinks(links) {
        const tbody = document.getElementById('links-tbody');
        const emptyState = document.getElementById('empty-state');
        const table = document.getElementById('links-table');
        
        if (!tbody) return;
        
        if (links.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        table.style.display = 'table';
        emptyState.style.display = 'none';
        
        tbody.innerHTML = links.map(link => {
            const usagePercent = (link.current_uses / link.max_uses) * 100;
            const isFull = link.current_uses >= link.max_uses;
            const statusClass = !link.is_active ? 'status-inactive' : (isFull ? 'status-full' : 'status-active');
            const statusText = !link.is_active ? 'Inactive' : (isFull ? 'Completed' : 'Active');
            const proxyUrl = \`\${window.location.origin}/proxy/\${link.proxy_id}\`;
            const shortUrl = proxyUrl.length > 35 ? proxyUrl.substring(0, 35) + '...' : proxyUrl;
            
            return \`
                <tr>
                    <td>
                        <div class="group-badge">
                            <i class="fas fa-users"></i>
                            \${link.group_name || 'Unnamed Group'}
                        </div>
                    </td>
                    <td>
                        <div class="proxy-link-cell" title="\${proxyUrl}">
                            \${shortUrl}
                            <button class="copy-btn-table" onclick="copyToClipboard('\${proxyUrl}')" title="Copy link">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                            <i class="fas fa-external-link-alt"></i> 
                            \${link.real_url.length > 40 ? link.real_url.substring(0, 40) + '...' : link.real_url}
                        </div>
                    </td>
                    <td class="usage-cell">
                        <div class="usage-stats-table">
                            <div class="usage-numbers">\${link.current_uses}/\${link.max_uses}</div>
                            <div class="usage-progress-table">
                                <div class="usage-fill-table \${isFull ? 'full' : ''}" style="width: \${usagePercent}%"></div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge \${statusClass}">\${statusText}</span>
                    </td>
                    <td>
                        <div class="created-date">
                            <i class="fas fa-calendar"></i>
                            \${new Date(link.created_at).toLocaleDateString()}
                        </div>
                    </td>
                    <td>
                        <div class="actions-cell">
                            <button onclick="copyProxyLink('\${proxyUrl}')" 
                                    class="btn-table btn-copy" 
                                    title="Copy proxy link">
                                <i class="fas fa-copy"></i>
                                Copy
                            </button>
                            <button onclick="toggleLink('\${link.proxy_id}', \${link.is_active})" 
                                    class="btn-table \${link.is_active ? 'btn-danger' : 'btn-success'}" 
                                    title="\${link.is_active ? 'Deactivate' : 'Activate'} group">
                                <i class="fas fa-\${link.is_active ? 'pause' : 'play'}"></i>
                                \${link.is_active ? 'Pause' : 'Start'}
                            </button>
                            <button onclick="resetUsage('\${link.proxy_id}')" 
                                    class="btn-table btn-secondary" 
                                    title="Reset usage count">
                                <i class="fas fa-redo"></i>
                                Reset
                            </button>
                            <button onclick="deleteLink('\${link.proxy_id}', '\${link.group_name || 'Unnamed Group'}')" 
                                    class="btn-table btn-delete" 
                                    title="Delete this experiment link">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            \`;
        }).join('');
    }
    
    function toggleLink(proxyId, isActive) {
        fetch('/admin/toggle-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proxyId, activate: !isActive })
        }).then(() => location.reload());
    }
    
    function resetUsage(proxyId) {
        if (confirm('Reset this group? This will allow 3 new participants to join.')) {
            fetch('/admin/reset-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proxyId })
            }).then(() => location.reload());
        }
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Proxy link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showToast('Failed to copy link', 'error');
        });
    }
    
    function copyProxyLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Proxy link copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast('Proxy link copied to clipboard!', 'success');
            } catch (fallbackErr) {
                showToast('Failed to copy link', 'error');
            }
            document.body.removeChild(textArea);
        });
    }
    
    function deleteLink(proxyId, groupName) {
        if (confirm(\`Are you sure you want to delete the experiment link for "\${groupName}"?\\n\\nThis action cannot be undone and will permanently remove:\\n• The proxy link\\n• All usage data\\n• Participant records\`)) {
            const button = event.target.closest('button');
            const originalContent = button.innerHTML;
            
            // Show loading state
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            button.disabled = true;
            
            fetch('/admin/delete-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proxyId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(\`Experiment link for "\${groupName}" deleted successfully\`, 'success');
                    // Remove the row with animation
                    const row = button.closest('tr');
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-100%)';
                    setTimeout(() => {
                        location.reload();
                    }, 300);
                } else {
                    throw new Error(data.error || 'Failed to delete link');
                }
            })
            .catch(error => {
                console.error('Error deleting link:', error);
                showToast('Failed to delete experiment link', 'error');
                button.innerHTML = originalContent;
                button.disabled = false;
            });
        }
    }
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = \`toast toast-\${type}\`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = \`<i class="\${icons[type]}"></i> \${message}\`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000);
    }
    
    function logout() {
        fetch('/admin/logout', { method: 'POST' })
            .then(() => location.reload());
    }
  `;
}

module.exports = {
    renderAdminPage,
    renderDashboard,
    renderLoginForm
};