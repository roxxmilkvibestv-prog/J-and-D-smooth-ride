// ==============================================================================
// J & D SMOOTH RIDE & LOGISTICS (KIGALI, RWANDA)
// Node.js + Express + Socket.io Real-Time Tracking & Fleet Relay Server
// ==============================================================================
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server: SocketIOServer } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ----------------------------------------------------
// SOCKET.IO REAL-TIME RELAY SETUP
// ----------------------------------------------------
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Active in-memory cache of Kigali drivers transmitting live GPS
const activeDrivers = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send current active drivers list on initial connect
  const driversList = Array.from(activeDrivers.values());
  socket.emit('active-drivers-list', driversList);

  // Relay driver live coordinates
  socket.on('driver-location-update', (data) => {
    if (!data) return;
    const lat = parseFloat(data.lat || data.latitude);
    const lng = parseFloat(data.lng || data.longitude);

    // CRITICAL: Filter out invalid or [0,0] ocean coordinates
    if (!lat || !lng || (lat === 0 && lng === 0) || isNaN(lat) || isNaN(lng)) {
      return;
    }

    const driverPayload = {
      driverId: data.driverId || socket.id,
      driverName: data.driverName || 'Verified Pilot',
      bikePlate: data.bikePlate || 'RAD 829 K',
      lat: lat,
      lng: lng,
      speed: data.speed || 35,
      heading: data.heading || 0,
      timestamp: Date.now()
    };

    activeDrivers.set(driverPayload.driverId, driverPayload);

    // Broadcast live to all connected client maps
    io.emit('driver-location-changed', driverPayload);
    io.emit('location-update', driverPayload);
  });

  socket.on('location-update', (data) => {
    socket.emit('driver-location-update', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ----------------------------------------------------
// PERSISTENT DATA STORAGE (Real Accounts Only - No Demos)
// ----------------------------------------------------
const DRIVERS_FILE = path.join(__dirname, 'drivers_registry.json');
const CLIENTS_FILE = path.join(__dirname, 'clients_registry.json');

function loadJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn(`[Storage Warning] Error reading ${filePath}:`, e.message);
  }
  return [];
}

function saveJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`[Storage Error] Failed to write ${filePath}:`, e.message);
  }
}

let registeredDrivers = loadJsonFile(DRIVERS_FILE);
let registeredClients = loadJsonFile(CLIENTS_FILE);

// ----------------------------------------------------
// GOOGLE SHEETS WEBHOOK INTEGRATION HELPER
// ----------------------------------------------------
async function syncToGoogleSheet(recordType, recordData) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.info('[Google Sheet Info] GOOGLE_SHEET_WEBHOOK_URL not configured. Export CSV is available at /api/export-sheets-csv.');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: recordType,
        timestamp: new Date().toISOString(),
        kigaliTime: new Date().toLocaleString('en-US', { timeZone: 'Africa/Kigali' }),
        data: recordData,
      }),
    });
    console.log(`[Google Sheet Sync] Successfully posted ${recordType} to Google Sheet Webhook (${response.status})`);
  } catch (err) {
    console.warn(`[Google Sheet Error] Failed to post ${recordType} to Google Sheet:`, err.message);
  }
}

// ----------------------------------------------------
// RESEND EMAIL HELPER FOR RIDER APPROVAL
// ----------------------------------------------------
const DEFAULT_ADMIN_EMAIL = 'corneliustch@gmail.com';

async function sendRiderApprovalEmail(driver) {
  const apiKey = (process.env.Email_api_key || process.env.EMAIL_API_KEY || '').trim();
  const adminEmail = (process.env.CUSTOMER_CARE_EMAIL || DEFAULT_ADMIN_EMAIL).trim();
  const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

  const approveLink = `${appUrl}/api/approve-driver?id=${encodeURIComponent(driver.id)}&token=${encodeURIComponent(driver.approvalToken)}`;

  if (!apiKey) {
    console.warn('[Email Approval Warning] Email_api_key not configured. Approval link:', approveLink);
    return { success: false, link: approveLink };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #336443; border-radius: 12px; background: #ffffff; color: #1c261b;">
      <div style="background: #141e12; padding: 20px 24px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
        <h2 style="color: #9ed3aa; margin: 0 0 6px 0; font-size: 20px;">J & D SMOOTH RIDE</h2>
        <p style="color: #c1c9bf; margin: 0; font-size: 13px;">Kigali Fleet Administration • Rider Approval Request</p>
      </div>

      <p style="font-size: 15px; line-height: 1.5;">A new pilot has applied to join the J &amp; D Kigali fleet and is awaiting your authorization:</p>

      <div style="background: #f4f8f5; border-left: 4px solid #336443; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; line-height: 1.8;">
        <div><strong>Full Legal Name:</strong> ${driver.fullName}</div>
        <div><strong>Phone / WhatsApp:</strong> <a href="tel:${driver.phone}" style="color: #27623a; font-weight: bold;">${driver.phone}</a></div>
        <div><strong>National ID (NIDA):</strong> ${driver.nationalId}</div>
        <div><strong>Motorbike Plate:</strong> <span style="background: #e2ece4; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${driver.bikePlate}</span></div>
        <div><strong>Motorbike Model:</strong> ${driver.bikeModel || 'TVS HLX 150'}</div>
        <div><strong>Category A License:</strong> ${driver.drivingLicenseClassA || 'Provided'}</div>
        <div><strong>MTN MoMo Payout:</strong> ${driver.momoNumber || driver.phone}</div>
        <div><strong>Preferred Zone:</strong> ${driver.preferredZone || 'Gasabo / Nyarugenge'}</div>
        <div><strong>Applied Date:</strong> ${new Date(driver.createdAt).toLocaleString('en-US', { timeZone: 'Africa/Kigali' })}</div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${approveLink}" style="background-color: #27623a; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(39, 98, 58, 0.4);">
          ✅ APPROVE RIDER ACCOUNT NOW
        </a>
      </div>

      <p style="font-size: 12px; color: #666; text-align: center;">
        Or copy and paste this link in your browser:<br/>
        <a href="${approveLink}" style="color: #27623a; word-break: break-all;">${approveLink}</a>
      </p>

      <div style="border-top: 1px solid #e2ece4; padding-top: 14px; margin-top: 24px; font-size: 12px; color: #888;">
        Once approved, the pilot can log in and broadcast live GPS on the Kigali network.
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'J&D Fleet Admin <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `[Action Required] New Rider Application: ${driver.fullName} (${driver.bikePlate})`,
        html: htmlContent
      })
    });
    return { success: res.ok, link: approveLink };
  } catch (err) {
    console.warn('[Email Approval Send Error]', err.message);
    return { success: false, error: err.message, link: approveLink };
  }
}

// ----------------------------------------------------
// API ROUTES: DRIVER APPLICATION & APPROVAL FLOW
// ----------------------------------------------------
app.post('/api/register-driver', async (req, res) => {
  const { fullName, phone, nationalId, bikePlate, bikeModel, momoNumber, drivingLicenseClassA, preferredZone } = req.body;

  if (!fullName || !phone || !nationalId || !bikePlate) {
    return res.status(400).json({ success: false, error: 'Full name, phone, NIDA national ID, and motorbike plate are required.' });
  }

  // Generate unique ID and approval token
  const driverId = 'pilot_' + Date.now();
  const approvalToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

  const newDriver = {
    id: driverId,
    fullName: fullName.trim(),
    phone: phone.trim(),
    nationalId: nationalId.trim(),
    bikePlate: bikePlate.trim().toUpperCase(),
    bikeModel: (bikeModel || 'Alpha MK1 Electric').trim(),
    momoNumber: (momoNumber || phone).trim(),
    drivingLicenseClassA: (drivingLicenseClassA || 'DL-KGL-VERIFIED').trim(),
    preferredZone: preferredZone || 'Gasabo (Kimihurura / Remera)',
    status: 'pending', // PENDING APPROVAL VIA EMAIL
    approvalToken: approvalToken,
    createdAt: new Date().toISOString(),
    approvedAt: null
  };

  // Upsert in registry
  const existingIndex = registeredDrivers.findIndex(d => d.phone === newDriver.phone || d.nationalId === newDriver.nationalId);
  if (existingIndex >= 0) {
    registeredDrivers[existingIndex] = { ...registeredDrivers[existingIndex], ...newDriver };
  } else {
    registeredDrivers.push(newDriver);
  }
  saveJsonFile(DRIVERS_FILE, registeredDrivers);

  // Sync to Google Sheet if configured
  syncToGoogleSheet('rider', newDriver);

  // Dispatch Email to corneliustch@gmail.com
  const emailResult = await sendRiderApprovalEmail(newDriver);

  return res.json({
    success: true,
    pending: true,
    driverId: newDriver.id,
    approvalLink: emailResult.link,
    message: 'Application submitted! An approval email has been sent to the administrator. You will receive access once approved.'
  });
});

// One-click Admin Approval Link via Email
app.get('/api/approve-driver', (req, res) => {
  const { id, token } = req.query;

  if (!id || !token) {
    return res.status(400).send('Invalid approval request. Missing driver ID or token.');
  }

  const driver = registeredDrivers.find(d => d.id === id && d.approvalToken === token);
  if (!driver) {
    return res.status(404).send('Driver application not found or invalid approval token.');
  }

  driver.status = 'approved';
  driver.approvedAt = new Date().toISOString();
  saveJsonFile(DRIVERS_FILE, registeredDrivers);

  // Sync updated status to Google Sheet
  syncToGoogleSheet('rider_approved', driver);

  // Return clean, professional HTML confirmation
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pilot Approved | J & D Smooth Ride</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { background: #0b160a; color: #d9e6d2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: #141e12; border: 1px solid #336443; border-radius: 20px; padding: 36px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .icon { width: 64px; height: 64px; border-radius: 50%; background: #336443; color: #9ed3aa; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px auto; }
        h1 { font-size: 24px; color: #ffffff; margin-bottom: 8px; }
        p { font-size: 14px; color: #c1c9bf; line-height: 1.6; margin-bottom: 24px; }
        .meta { background: #182216; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; font-size: 13px; }
        .meta div { margin-bottom: 6px; }
        .btn { display: inline-block; background: #9ed3aa; color: #02391c; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 9999px; text-transform: uppercase; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✓</div>
        <h1>Pilot Account Approved!</h1>
        <p>The pilot application has been authorized. They can now log in and transmit live coordinates across Kigali.</p>
        <div class="meta">
          <div><strong>Pilot Name:</strong> ${driver.fullName}</div>
          <div><strong>Plate Number:</strong> ${driver.bikePlate}</div>
          <div><strong>Phone:</strong> ${driver.phone}</div>
          <div><strong>National ID:</strong> ${driver.nationalId}</div>
          <div><strong>Status:</strong> <span style="color: #9ed3aa; font-weight: bold;">ACTIVE &amp; APPROVED</span></div>
        </div>
        <a href="/" class="btn">Return to J &amp; D Portal</a>
      </div>
    </body>
    </html>
  `);
});

// Driver Login Endpoint (Checks real approval - NO DEMO FALLBACK)
app.post('/api/driver-login', (req, res) => {
  const { phone, identifier } = req.body;
  const searchId = (phone || identifier || '').trim().replace(/\s+/g, '');

  if (!searchId) {
    return res.status(400).json({ success: false, error: 'Phone number or National ID is required.' });
  }

  const driver = registeredDrivers.find(d => 
    d.phone.replace(/\s+/g, '').includes(searchId) || 
    searchId.includes(d.phone.replace(/\s+/g, '')) ||
    d.nationalId.replace(/\s+/g, '') === searchId
  );

  if (!driver) {
    return res.status(404).json({ 
      success: false, 
      error: 'No registered driver found with this phone number. Please submit an application first.' 
    });
  }

  if (driver.status !== 'approved') {
    return res.status(403).json({
      success: false,
      pending: true,
      error: 'Your rider application is awaiting administrative review. An authorization email has been dispatched to management.'
    });
  }

  return res.json({
    success: true,
    driver: driver
  });
});

// ----------------------------------------------------
// API ROUTES: CLIENT REGISTRATION & LOGIN
// ----------------------------------------------------
app.post('/api/register-client', (req, res) => {
  const { fullName, phone, email, momoNumber, accountType, preferredSector } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ success: false, error: 'Full name and phone number are required.' });
  }

  const client = {
    id: 'client_' + Date.now(),
    fullName: fullName.trim(),
    phone: phone.trim(),
    email: (email || '').trim(),
    momoNumber: (momoNumber || phone).trim(),
    accountType: accountType || 'vip_concierge',
    preferredSector: preferredSector || 'Gasabo (Kigali Heights)',
    createdAt: new Date().toISOString()
  };

  const existingIndex = registeredClients.findIndex(c => c.phone === client.phone);
  if (existingIndex >= 0) {
    registeredClients[existingIndex] = { ...registeredClients[existingIndex], ...client };
  } else {
    registeredClients.push(client);
  }
  saveJsonFile(CLIENTS_FILE, registeredClients);

  // Sync client to Google Sheet
  syncToGoogleSheet('client', client);

  return res.json({ success: true, client });
});

app.post('/api/client-login', (req, res) => {
  const { phone } = req.body;
  const searchPhone = (phone || '').trim().replace(/\s+/g, '');

  if (!searchPhone) {
    return res.status(400).json({ success: false, error: 'Phone number is required.' });
  }

  const client = registeredClients.find(c => 
    c.phone.replace(/\s+/g, '').includes(searchPhone) || 
    searchPhone.includes(c.phone.replace(/\s+/g, ''))
  );

  if (!client) {
    return res.status(404).json({
      success: false,
      error: 'No client profile found for this number. Please create a client account.'
    });
  }

  return res.json({ success: true, client });
});

// ----------------------------------------------------
// GOOGLE SHEETS CSV EXPORT ROUTE
// ----------------------------------------------------
app.get('/api/export-sheets-csv', (req, res) => {
  const type = req.query.type || 'all';
  let csv = '';

  if (type === 'riders' || type === 'all') {
    csv += '--- REGISTERED RIDERS / PILOTS ---\n';
    csv += 'ID,Full Name,Phone,National ID,Bike Plate,Bike Model,MoMo Number,Status,Created At,Approved At\n';
    registeredDrivers.forEach(d => {
      csv += `"${d.id}","${d.fullName}","${d.phone}","${d.nationalId}","${d.bikePlate}","${d.bikeModel}","${d.momoNumber}","${d.status}","${d.createdAt}","${d.approvedAt || ''}"\n`;
    });
    csv += '\n';
  }

  if (type === 'clients' || type === 'all') {
    csv += '--- REGISTERED CLIENTS ---\n';
    csv += 'ID,Full Name,Phone,Email,MoMo Number,Account Type,Sector,Created At\n';
    registeredClients.forEach(c => {
      csv += `"${c.id}","${c.fullName}","${c.phone}","${c.email}","${c.momoNumber}","${c.accountType}","${c.preferredSector}","${c.createdAt}"\n`;
    });
  }

  res.header('Content-Type', 'text/csv');
  res.attachment('kigali_fleet_records.csv');
  return res.send(csv);
});

// ----------------------------------------------------
// STATIC & FRONTEND SERVING
// ----------------------------------------------------
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Dedicated direct paths for client tracking and driver portal
app.get('/client.html', (req, res) => res.sendFile(path.join(publicPath, 'client.html')));
app.get('/tracking', (req, res) => res.sendFile(path.join(publicPath, 'client.html')));
app.get('/driver.html', (req, res) => res.sendFile(path.join(publicPath, 'driver.html')));
app.get('/driver-portal', (req, res) => res.sendFile(path.join(publicPath, 'driver.html')));

// Fallback to client.html if direct access requested
app.get('/map', (req, res) => res.sendFile(path.join(publicPath, 'client.html')));

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[J&D Smooth Ride] Server running on port ${PORT}`);
  console.log(`[Map Views] Client Tracking: http://localhost:${PORT}/client.html | Driver Portal: http://localhost:${PORT}/driver.html`);
});
