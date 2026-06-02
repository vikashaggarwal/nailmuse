// ============================================================
// NAIL MUSE — Google Apps Script
// Paste this at script.google.com (or via Extensions > Apps Script)
// Deploy as Web App: Execute as Me | Access: Anyone
// ============================================================

const SPREADSHEET_ID  = 'YOUR_GOOGLE_SHEET_ID_HERE';   // ← paste your Sheet ID
const OWNER_EMAIL     = 'nailmuse2016@gmail.com';    // ← your email
const STUDIO_WHATSAPP = '918879336671';                 // already set

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    saveToSheet(data);
    sendConfirmationToClient(data);
    notifyOwner(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, ref: data.bookingRef }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Nail Muse Booking API is live ✅');
}

// ── Save row to Google Sheet ──────────────────────────────
function saveToSheet(data) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  let   sheet = ss.getSheetByName('Bookings');

  // Auto-create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('Bookings');
    const headers = [
      'Booking Ref', 'Date Received', 'Name', 'Phone', 'Email',
      'Service', 'Appt Date', 'Time Slot', 'Special Requests',
      'Referral Source', 'Status'
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold')
               .setBackground('#C2185B')
               .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.bookingRef,
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    data.name,
    '+91 ' + data.phone,
    data.email,
    data.service,
    data.date,
    data.time,
    data.requests  || '—',
    data.referral  || '—',
    'Pending Confirmation'
  ]);
}

// ── Confirmation email to client ──────────────────────────
function sendConfirmationToClient(data) {
  const subject = `✨ Booking Received — ${data.bookingRef} | Nail Muse`;

  const body = `
Hi ${data.name}! 💅

Your booking request has been received at Nail Muse.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Booking Reference : ${data.bookingRef}
  Service           : ${data.service}
  Date              : ${data.date}
  Time              : ${data.time}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We will confirm your appointment via WhatsApp (+91 88793 36671)
within 2 hours during business hours (Mon–Sat, 10am–7pm).

Special Requests noted: ${data.requests || 'None'}

📍 Nail Muse Studio, Mumbai, Maharashtra
🌐 nailmuse.in | 📸 @nailmuse.in

Cancellation Policy: Please cancel at least 24 hours in advance.

Can't wait to create something beautiful for you! ✨

With love,
Team Nail Muse
  `.trim();

  GmailApp.sendEmail(data.email, subject, body, {
    name: 'Nail Muse Studio',
    replyTo: OWNER_EMAIL
  });
}

// ── Notify salon owner by email ───────────────────────────
function notifyOwner(data) {
  const subject = `🔔 New Booking ${data.bookingRef} — ${data.name} | ${data.service}`;

  const body = `
New booking received on nailmuse.in!

Booking Ref  : ${data.bookingRef}
Name         : ${data.name}
Phone        : +91 ${data.phone}
Email        : ${data.email}
Service      : ${data.service}
Appt Date    : ${data.date}
Time Slot    : ${data.time}
Requests     : ${data.requests || 'None'}
Referral     : ${data.referral  || 'Not specified'}
Received at  : ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

Reply on WhatsApp: https://wa.me/91${data.phone}
  `.trim();

  GmailApp.sendEmail(OWNER_EMAIL, subject, body);
}
