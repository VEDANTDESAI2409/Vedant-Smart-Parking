require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

console.log('Testing Twilio SMS send...\n');

// Generate a test OTP
const testOtp = Math.floor(100000 + Math.random() * 900000);

// Use your own phone to test (CHANGE THIS TO YOUR ACTUAL NUMBER)
const testPhone = '+919876543210';

console.log('Sending test SMS:');
console.log('- From:', process.env.TWILIO_PHONE_NUMBER);
console.log('- To:', testPhone);
console.log('- OTP:', testOtp);
console.log('\nAttempting to send...\n');

client.messages.create({
  body: `Your Smart Parking OTP is ${testOtp}. It is valid for 5 minutes.`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: testPhone,
}).then((message) => {
  console.log('✅ SMS SENT SUCCESSFULLY!');
  console.log('Message SID:', message.sid);
  console.log('Status:', message.status);
  console.log('\n✓ Check your phone for the SMS');
  process.exit(0);
}).catch((error) => {
  console.error('❌ SMS FAILED');
  console.error('Error Code:', error.code);
  console.error('Error Message:', error.message);
  process.exit(1);
});
