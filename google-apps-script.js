// ============================================================
// NAIL MUSE — Google Apps Script
// SETUP:
//   1. Go to script.google.com → open your Nail Muse project
//   2. Select All (Cmd+A) → Delete → Paste this entire file
//   3. Replace PASTE_YOUR_SHEET_ID_HERE with your Google Sheet ID
//      (the long ID from the sheet URL between /d/ and /edit)
//   4. Deploy → New Deployment → Web App
//      Execute as: Me  |  Access: Anyone
//   5. Authorise all permissions when prompted
// ============================================================

const SPREADSHEET_ID = '1Xp4ohREcL3JVbL3iUdAXnY7he5tpKkFTPPHthcIsuO8';
const OWNER_EMAIL    = 'nailmuse2016@gmail.com';
const WHATSAPP_NUM   = '918879336671';

// ── Entry point: receives form submissions ────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    saveToSheet(data);
    emailClient(data);
    emailOwner(data);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, ref: data.bookingRef }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Health check ──────────────────────────────────────────────
function doGet() {
  return ContentService
    .createTextOutput('Nail Muse Booking API is live ✅')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── Save booking row to Google Sheet ─────────────────────────
function saveToSheet(data) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Bookings');

  if (!sheet) {
    sheet = ss.insertSheet('Bookings');
    var headers = [
      'Booking Ref', 'Received (IST)', 'Name', 'Phone', 'Email',
      'Service', 'Appt Date', 'Time Slot',
      'Special Requests', 'Referral Source', 'Status'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight('bold')
         .setBackground('#C2185B')
         .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    // Pre-format phone column as plain text so +91 doesn't trigger formula error
    sheet.getRange('D:D').setNumberFormat('@STRING@');
  }

  // Append row WITHOUT phone first (avoids formula parse error on +91)
  sheet.appendRow([
    data.bookingRef || 'NM-UNKNOWN',
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    data.name        || '',
    '',               // phone placeholder — set below after formatting
    data.email       || '',
    data.service     || '',
    data.date        || '',
    data.time        || '',
    data.requests    || '—',
    data.referral    || '—',
    'Pending Confirmation'
  ]);

  // Set phone AFTER formatting cell as plain text — prevents formula error
  var lastRow  = sheet.getLastRow();
  var phoneCell = sheet.getRange(lastRow, 4);
  phoneCell.setNumberFormat('@STRING@');
  phoneCell.setValue('+91 ' + (data.phone || ''));
}

// ── Send confirmation email to customer ──────────────────────
function emailClient(data) {
  if (!data.email) return;

  var subject = '✨ Booking Received — ' + data.bookingRef + ' | Nail Muse';
  var body =
    'Hi ' + data.name + '! 💅\n\n' +
    'Your booking request has been received at Nail Muse.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '  Booking Ref : ' + data.bookingRef + '\n' +
    '  Service     : ' + data.service + '\n' +
    '  Date        : ' + data.date + '\n' +
    '  Time        : ' + data.time + '\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'We will confirm via WhatsApp (+91 88793 36671) within 2 hours\n' +
    'during business hours (Mon–Sun, 11am–9:30pm).\n\n' +
    (data.requests ? 'Special Requests: ' + data.requests + '\n\n' : '') +
    '📍 Shop No 5, Bhoomi Classic, New Link Rd, Malad West, Mumbai 400064\n' +
    '🌐 nailmuse.in  |  📸 @nailmuse2016\n\n' +
    'Cancellation Policy: Please cancel at least 24 hours in advance.\n\n' +
    'Can\'t wait to create something beautiful for you! ✨\n\n' +
    'With love,\nTeam Nail Muse';

  GmailApp.sendEmail(data.email, subject, body, {
    name: 'Nail Muse Studio',
    replyTo: OWNER_EMAIL
  });
}

// ── Alert email to salon owner ────────────────────────────────
function emailOwner(data) {
  var subject = '🔔 New Booking ' + data.bookingRef + ' — ' + data.name + ' | ' + data.service;
  var body =
    'New booking received on nailmuse.in!\n\n' +
    'Booking Ref : ' + data.bookingRef + '\n' +
    'Name        : ' + data.name + '\n' +
    'Phone       : +91 ' + data.phone + '\n' +
    'Email       : ' + data.email + '\n' +
    'Service     : ' + data.service + '\n' +
    'Date        : ' + data.date + '\n' +
    'Time        : ' + data.time + '\n' +
    'Requests    : ' + (data.requests || 'None') + '\n' +
    'Referral    : ' + (data.referral  || 'Not specified') + '\n' +
    'Received    : ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST\n\n' +
    '👉 Reply on WhatsApp: https://wa.me/91' + data.phone;

  GmailApp.sendEmail(OWNER_EMAIL, subject, body);
}

// ── Manual test: run this from Apps Script editor to verify ──
// Select testBooking → click Run → check Sheet + inbox
function testBooking() {
  var fake = {
    bookingRef : 'NM-TEST-001',
    name       : 'Test Client',
    phone      : '9999999999',
    email      : OWNER_EMAIL,
    service    : 'Gel Manicure — ₹899',
    date       : '2026-06-10',
    time       : '11:00 AM',
    requests   : 'Test booking — please ignore',
    referral   : 'Test'
  };
  saveToSheet(fake);
  emailClient(fake);
  emailOwner(fake);
  Logger.log('Test booking sent! Check sheet and inbox.');
}
