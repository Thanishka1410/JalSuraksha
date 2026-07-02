const nodemailer = require('nodemailer');

// Gracefully skip emails if no SMTP credentials configured
const isConfigured = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const FROM = `"JalRakshak AI" <${process.env.EMAIL_USER || 'noreply@jalrakshak.gov.in'}>`;

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f0f9ff;
  padding: 24px;
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
`;
const headerStyle = `
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  color: white;
  padding: 20px 24px;
  border-radius: 8px 8px 0 0;
  font-size: 22px;
  font-weight: bold;
`;
const bodyStyle = `
  background: white;
  padding: 24px;
  border-radius: 0 0 8px 8px;
  border: 1px solid #e0f2fe;
`;
const badgeStyle = (color) => `
  display: inline-block;
  background: ${color};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
`;
const footerStyle = `
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 16px;
`;

/**
 * Send an email notification when a complaint is assigned to a technician.
 */
const sendComplaintAssignmentEmail = async (technicianEmail, technicianName, complaint) => {
  if (!isConfigured || !transporter) return;
  try {
    const categoryMap = { leakage: 'Leakage', no_water: 'No Water', dirty_water: 'Dirty Water', low_pressure: 'Low Pressure', other: 'Other' };
    const priorityColors = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
    const color = priorityColors[complaint.priority] || '#0ea5e9';

    await transporter.sendMail({
      from: FROM,
      to: technicianEmail,
      subject: `[JalRakshak] New Complaint Assigned — ${categoryMap[complaint.category] || complaint.category}`,
      html: `
        <div style="${baseStyle}">
          <div style="${headerStyle}">💧 JalRakshak AI — New Complaint Assigned</div>
          <div style="${bodyStyle}">
            <p>Dear <strong>${technicianName}</strong>,</p>
            <p>A new complaint has been assigned to you:</p>
            <span style="${badgeStyle(color)}">${complaint.priority?.toUpperCase()} PRIORITY</span>
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr><td style="padding:8px 0; color:#64748b; width:40%">Category</td><td><strong>${categoryMap[complaint.category] || complaint.category}</strong></td></tr>
              <tr><td style="padding:8px 0; color:#64748b;">Description</td><td>${complaint.description}</td></tr>
              <tr><td style="padding:8px 0; color:#64748b;">Status</td><td><strong>${complaint.status}</strong></td></tr>
            </table>
            <p style="margin-top:16px; font-size:13px; color:#475569;">Please log in to the JalRakshak portal to review and update this complaint.</p>
          </div>
          <div style="${footerStyle}">JalRakshak AI | Jal Jeevan Mission | Government of India</div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[EmailService] Failed to send assignment email:', err.message);
  }
};

/**
 * Send notification when complaint status changes.
 */
const sendComplaintStatusUpdateEmail = async (citizenEmail, citizenName, complaint, newStatus) => {
  if (!isConfigured || !transporter) return;
  try {
    const statusMessages = {
      assigned: 'Your complaint has been assigned to a technician.',
      in_progress: 'Work on your complaint has started. Our team is on it!',
      resolved: 'Great news! Your complaint has been resolved.',
      closed: 'Your complaint has been closed. Thank you for your feedback.',
    };
    const statusColors = { assigned: '#f59e0b', in_progress: '#3b82f6', resolved: '#22c55e', closed: '#6b7280' };
    const msg = statusMessages[newStatus] || `Your complaint status has been updated to: ${newStatus}.`;
    const color = statusColors[newStatus] || '#0ea5e9';

    await transporter.sendMail({
      from: FROM,
      to: citizenEmail,
      subject: `[JalRakshak] Complaint Update — ${newStatus.replace('_', ' ').toUpperCase()}`,
      html: `
        <div style="${baseStyle}">
          <div style="${headerStyle}">💧 JalRakshak AI — Complaint Status Update</div>
          <div style="${bodyStyle}">
            <p>Dear <strong>${citizenName}</strong>,</p>
            <span style="${badgeStyle(color)}">${newStatus.replace('_', ' ').toUpperCase()}</span>
            <p>${msg}</p>
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr><td style="padding:8px 0; color:#64748b; width:40%">Category</td><td><strong>${complaint.category}</strong></td></tr>
              <tr><td style="padding:8px 0; color:#64748b;">Description</td><td>${complaint.description}</td></tr>
              ${complaint.resolutionNotes ? `<tr><td style="padding:8px 0; color:#64748b;">Resolution Notes</td><td>${complaint.resolutionNotes}</td></tr>` : ''}
            </table>
            <p style="margin-top:16px; font-size:13px; color:#475569;">Log in to the JalRakshak portal to track all your complaints.</p>
          </div>
          <div style="${footerStyle}">JalRakshak AI | Jal Jeevan Mission | Government of India</div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[EmailService] Failed to send status update email:', err.message);
  }
};

/**
 * Send water quality alert to GP admin when unsafe/needs-inspection detected.
 */
const sendWaterQualityAlertEmail = async (adminEmail, adminName, qualityRecord, village) => {
  if (!isConfigured || !transporter) return;
  try {
    const isUnsafe = qualityRecord.overallStatus === 'unsafe';
    const color = isUnsafe ? '#ef4444' : '#f59e0b';
    const label = isUnsafe ? '🚨 UNSAFE' : '⚠️ NEEDS INSPECTION';
    const params = qualityRecord.parameters || {};

    await transporter.sendMail({
      from: FROM,
      to: adminEmail,
      subject: `[JalRakshak] Water Quality Alert — ${village} — ${label}`,
      html: `
        <div style="${baseStyle}">
          <div style="${headerStyle}">💧 JalRakshak AI — Water Quality Alert</div>
          <div style="${bodyStyle}">
            <p>Dear <strong>${adminName}</strong>,</p>
            <span style="${badgeStyle(color)}">${label}</span>
            <p>A water quality test for <strong>${village}</strong> has returned results requiring attention:</p>
            <table style="width:100%; border-collapse:collapse; font-size:14px; border:1px solid #e2e8f0; border-radius:8px;">
              <thead style="background:#f8fafc;">
                <tr>
                  <th style="padding:10px 12px; text-align:left; color:#475569;">Parameter</th>
                  <th style="padding:10px 12px; text-align:right; color:#475569;">Value</th>
                  <th style="padding:10px 12px; text-align:right; color:#475569;">Safe Range</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding:8px 12px;">pH</td><td style="text-align:right;">${params.pH?.toFixed(2) || 'N/A'}</td><td style="text-align:right;color:#64748b;">6.5 – 8.5</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:8px 12px;">TDS (ppm)</td><td style="text-align:right;">${params.TDS?.toFixed(0) || 'N/A'}</td><td style="text-align:right;color:#64748b;">&lt; 500</td></tr>
                <tr><td style="padding:8px 12px;">Turbidity (NTU)</td><td style="text-align:right;">${params.turbidity?.toFixed(2) || 'N/A'}</td><td style="text-align:right;color:#64748b;">&lt; 4</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:8px 12px;">Chlorine (mg/L)</td><td style="text-align:right;">${params.chlorine?.toFixed(2) || 'N/A'}</td><td style="text-align:right;color:#64748b;">0.2 – 1.0</td></tr>
              </tbody>
            </table>
            ${qualityRecord.recommendations?.length ? `<p style="margin-top:12px;"><strong>Recommendations:</strong> ${qualityRecord.recommendations.join(', ')}</p>` : ''}
            <p style="margin-top:16px; font-size:13px; color:#475569;">Please take immediate action and log in to the JalRakshak portal for more details.</p>
          </div>
          <div style="${footerStyle}">JalRakshak AI | Jal Jeevan Mission | Government of India</div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[EmailService] Failed to send water quality alert email:', err.message);
  }
};

module.exports = {
  sendComplaintAssignmentEmail,
  sendComplaintStatusUpdateEmail,
  sendWaterQualityAlertEmail,
  isConfigured,
};
