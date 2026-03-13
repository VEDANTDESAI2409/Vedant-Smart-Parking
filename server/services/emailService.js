const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Smart Parking'} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  bookingConfirmation: (data) => ({
    subject: 'Booking Confirmed - Smart Parking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Confirmed!</h2>
        <p>Dear ${data.userName},</p>
        <p>Your parking booking has been confirmed with the following details:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p><strong>Parking Slot:</strong> ${data.slotNumber}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Start Time:</strong> ${data.startTime}</p>
          <p><strong>End Time:</strong> ${data.endTime}</p>
          <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
        </div>
        <p><strong>Check-in Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #007bff;">${data.checkInCode}</span></p>
        <p>Please arrive at least 15 minutes before your booking time.</p>
        <p>Thank you for choosing Smart Parking!</p>
      </div>
    `
  }),

  bookingReminder: (data) => ({
    subject: 'Booking Reminder - Smart Parking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Reminder</h2>
        <p>Dear ${data.userName},</p>
        <p>This is a reminder for your upcoming parking booking:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p><strong>Parking Slot:</strong> ${data.slotNumber}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Start Time:</strong> ${data.startTime}</p>
        </div>
        <p>Please arrive on time. Your check-in code is: <strong>${data.checkInCode}</strong></p>
      </div>
    `
  }),

  bookingCancelled: (data) => ({
    subject: 'Booking Cancelled - Smart Parking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Cancelled</h2>
        <p>Dear ${data.userName},</p>
        <p>Your booking has been cancelled:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
          ${data.refundAmount ? `<p><strong>Refund Amount:</strong> $${data.refundAmount}</p>` : ''}
        </div>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `
  }),

  paymentSuccess: (data) => ({
    subject: 'Payment Successful - Smart Parking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Successful</h2>
        <p>Dear ${data.userName},</p>
        <p>Your payment has been processed successfully:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Payment Reference:</strong> ${data.paymentReference}</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
        </div>
        <p>Thank you for your payment!</p>
      </div>
    `
  }),

  welcome: (data) => ({
    subject: 'Welcome to Smart Parking!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Smart Parking!</h2>
        <p>Dear ${data.userName},</p>
        <p>Thank you for registering with Smart Parking. Your account has been created successfully.</p>
        <p>You can now book parking slots, manage your vehicles, and enjoy our smart parking services.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Registration Date:</strong> ${data.registrationDate}</p>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
      </div>
    `
  })
};

// Send booking confirmation email
const sendBookingConfirmation = async (userEmail, userName, bookingData) => {
  const template = emailTemplates.bookingConfirmation({
    userName,
    ...bookingData
  });

  return await sendEmail({
    email: userEmail,
    ...template
  });
};

// Send booking reminder email
const sendBookingReminder = async (userEmail, userName, bookingData) => {
  const template = emailTemplates.bookingReminder({
    userName,
    ...bookingData
  });

  return await sendEmail({
    email: userEmail,
    ...template
  });
};

// Send booking cancellation email
const sendBookingCancellation = async (userEmail, userName, bookingData) => {
  const template = emailTemplates.bookingCancelled({
    userName,
    ...bookingData
  });

  return await sendEmail({
    email: userEmail,
    ...template
  });
};

// Send payment success email
const sendPaymentSuccess = async (userEmail, userName, paymentData) => {
  const template = emailTemplates.paymentSuccess({
    userName,
    ...paymentData
  });

  return await sendEmail({
    email: userEmail,
    ...template
  });
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName, userData) => {
  const template = emailTemplates.welcome({
    userName,
    ...userData
  });

  return await sendEmail({
    email: userEmail,
    ...template
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingCancellation,
  sendPaymentSuccess,
  sendWelcomeEmail,
  emailTemplates
};