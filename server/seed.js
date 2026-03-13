const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

// Load models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Vehicle = require('./models/Vehicle');
const ParkingSlot = require('./models/ParkingSlot');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Notification = require('./models/Notification');

// Load environment variables
dotenv.config();

// Sample data
const sampleData = {
  admins: [
    {
      name: 'System Admin',
      email: 'admin@smartparking.com',
      password: 'admin123',
      role: 'superadmin',
      permissions: ['manage_users', 'manage_slots', 'manage_bookings', 'manage_payments', 'view_reports', 'manage_admins', 'system_settings']
    },
    {
      name: 'Parking Manager',
      email: 'manager@smartparking.com',
      password: 'Manager123!',
      role: 'admin',
      permissions: ['manage_slots', 'manage_bookings', 'view_reports']
    }
  ],

  users: [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      phone: '+1234567890',
      licenseNumber: 'DL123456789',
      isVerified: true
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'Password123!',
      phone: '+1234567891',
      licenseNumber: 'DL987654321',
      isVerified: true
    },
    {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      password: 'Password123!',
      phone: '+1234567892',
      licenseNumber: 'DL456789123',
      isVerified: true
    },
    {
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      password: 'Password123!',
      phone: '+1234567893',
      licenseNumber: 'DL789123456',
      isVerified: false
    }
  ],

  vehicles: [
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      color: 'Blue',
      licensePlate: 'ABC123',
      vehicleType: 'car',
      registrationExpiry: new Date('2025-12-31')
    },
    {
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      color: 'Red',
      licensePlate: 'XYZ789',
      vehicleType: 'car',
      registrationExpiry: new Date('2025-11-30')
    },
    {
      make: 'Ford',
      model: 'F-150',
      year: 2021,
      color: 'Black',
      licensePlate: 'TRK456',
      vehicleType: 'truck',
      registrationExpiry: new Date('2026-01-15')
    },
    {
      make: 'BMW',
      model: 'X5',
      year: 2022,
      color: 'White',
      licensePlate: 'SUV789',
      vehicleType: 'suv',
      registrationExpiry: new Date('2025-10-20')
    },
    {
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      color: 'Silver',
      licensePlate: 'EVC123',
      vehicleType: 'electric',
      registrationExpiry: new Date('2026-03-10')
    }
  ],

  parkingSlots: [
    // Level 1
    { slotNumber: 'L1-A01', location: 'Level 1 - Section A', area: 'Level 1', floor: 1, section: 'A', slotType: 'standard', vehicleType: 'any', hourlyRate: 5, dailyRate: 30 },
    { slotNumber: 'L1-A02', location: 'Level 1 - Section A', area: 'Level 1', floor: 1, section: 'A', slotType: 'standard', vehicleType: 'any', hourlyRate: 5, dailyRate: 30 },
    { slotNumber: 'L1-A03', location: 'Level 1 - Section A', area: 'Level 1', floor: 1, section: 'A', slotType: 'standard', vehicleType: 'any', hourlyRate: 5, dailyRate: 30 },
    { slotNumber: 'L1-B01', location: 'Level 1 - Section B', area: 'Level 1', floor: 1, section: 'B', slotType: 'premium', vehicleType: 'any', hourlyRate: 8, dailyRate: 45 },
    { slotNumber: 'L1-B02', location: 'Level 1 - Section B', area: 'Level 1', floor: 1, section: 'B', slotType: 'premium', vehicleType: 'any', hourlyRate: 8, dailyRate: 45 },
    { slotNumber: 'L1-C01', location: 'Level 1 - Section C', area: 'Level 1', floor: 1, section: 'C', slotType: 'standard', vehicleType: 'any', hourlyRate: 4, dailyRate: 25 },
    { slotNumber: 'L1-C02', location: 'Level 1 - Section C', area: 'Level 1', floor: 1, section: 'C', slotType: 'standard', vehicleType: 'any', hourlyRate: 4, dailyRate: 25 },

    // Level 2
    { slotNumber: 'L2-A01', location: 'Level 2 - Section A', area: 'Level 2', floor: 2, section: 'A', slotType: 'standard', vehicleType: 'any', hourlyRate: 5, dailyRate: 30 },
    { slotNumber: 'L2-A02', location: 'Level 2 - Section A', area: 'Level 2', floor: 2, section: 'A', slotType: 'standard', vehicleType: 'any', hourlyRate: 5, dailyRate: 30 },
    { slotNumber: 'L2-B01', location: 'Level 2 - Section B', area: 'Level 2', floor: 2, section: 'B', slotType: 'premium', vehicleType: 'any', hourlyRate: 8, dailyRate: 45 },
    { slotNumber: 'L2-B02', location: 'Level 2 - Section B', area: 'Level 2', floor: 2, section: 'B', slotType: 'premium', vehicleType: 'any', hourlyRate: 8, dailyRate: 45 },
    { slotNumber: 'L2-C01', location: 'Level 2 - Section C', area: 'Level 2', floor: 2, section: 'C', slotType: 'electric', vehicleType: 'any', hourlyRate: 6, dailyRate: 35 },
    { slotNumber: 'L2-C02', location: 'Level 2 - Section C', area: 'Level 2', floor: 2, section: 'C', slotType: 'electric', vehicleType: 'any', hourlyRate: 6, dailyRate: 35 },

    // Level 3
    { slotNumber: 'L3-A01', location: 'Level 3 - Section A', area: 'Level 3', floor: 3, section: 'A', slotType: 'standard', vehicleType: 'any', hourlyRate: 5, dailyRate: 30 },
    { slotNumber: 'L3-A02', location: 'Level 3 - Section A', area: 'Level 3', floor: 3, section: 'A', slotType: 'standard', vehicleType: 'any', hourlyRate: 5, dailyRate: 30 },
    { slotNumber: 'L3-B01', location: 'Level 3 - Section B', area: 'Level 3', floor: 3, section: 'B', slotType: 'covered', vehicleType: 'any', hourlyRate: 7, dailyRate: 40 },
    { slotNumber: 'L3-B02', location: 'Level 3 - Section B', area: 'Level 3', floor: 3, section: 'B', slotType: 'covered', vehicleType: 'any', hourlyRate: 7, dailyRate: 40 }
  ]
};

// Helper function to get random element from array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random date within last 30 days
const getRandomDate = (daysAgo = 30) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
  return pastDate;
};

// Seed database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      ParkingSlot.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // Seed admins
    console.log('👨‍💼 Seeding admins...');
    const createdAdmins = await Admin.create(sampleData.admins);
    console.log(`✅ Created ${createdAdmins.length} admins`);

    // Seed users
    console.log('👥 Seeding users...');
    const createdUsers = await User.create(sampleData.users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed vehicles and assign to users
    console.log('🚗 Seeding vehicles...');
    const createdVehicles = [];
    for (let i = 0; i < sampleData.vehicles.length; i++) {
      const vehicle = sampleData.vehicles[i];
      const randomUser = getRandomElement(createdUsers);
      vehicle.owner = randomUser._id;
      if (i === 0) vehicle.isDefault = true; // Make first vehicle default for first user
      createdVehicles.push(await Vehicle.create(vehicle));
    }
    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    // Seed parking slots
    console.log('🅿️ Seeding parking slots...');
    const createdSlots = await ParkingSlot.create(sampleData.parkingSlots);
    console.log(`✅ Created ${createdSlots.length} parking slots`);

    // Seed bookings and payments
    console.log('📅 Seeding bookings and payments...');
    const createdBookings = [];
    const createdPayments = [];

    for (let i = 0; i < 20; i++) {
      const randomUser = getRandomElement(createdUsers);
      const userVehicles = createdVehicles.filter(v => v.owner.toString() === randomUser._id.toString());
      if (userVehicles.length === 0) continue;

      const randomVehicle = getRandomElement(userVehicles);
      const randomSlot = getRandomElement(createdSlots);

      // Create booking
      const startTime = getRandomDate(30);
      const duration = Math.floor(Math.random() * 8) + 1; // 1-8 hours
      const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

      const booking = await Booking.create({
        user: randomUser._id,
        vehicle: randomVehicle._id,
        parkingSlot: randomSlot._id,
        bookingReference: `BK${Date.now()}${i}`,
        startTime,
        endTime,
        duration,
        status: getRandomElement(['completed', 'cancelled', 'active']),
        bookingType: getRandomElement(['hourly', 'daily']),
        pricing: {
          hourlyRate: randomSlot.hourlyRate,
          dailyRate: randomSlot.dailyRate,
          totalAmount: duration * randomSlot.hourlyRate,
          taxAmount: (duration * randomSlot.hourlyRate) * 0.1,
          finalAmount: (duration * randomSlot.hourlyRate) * 1.1
        },
        specialRequests: Math.random() > 0.7 ? 'Near elevator' : null
      });

      createdBookings.push(booking);

      // Create payment for completed bookings
      if (booking.status === 'completed') {
        const payment = await Payment.create({
          user: randomUser._id,
          booking: booking._id,
          paymentReference: `PAY${Date.now()}${i}`,
          amount: booking.pricing.finalAmount,
          currency: 'USD',
          paymentMethod: getRandomElement(['credit_card', 'debit_card', 'paypal']),
          status: 'completed',
          transactionId: `TXN${Date.now()}${i}`,
          paymentGateway: 'stripe',
          metadata: {
            cardLast4: '4242',
            cardBrand: 'visa'
          }
        });
        createdPayments.push(payment);
      }
    }
    console.log(`✅ Created ${createdBookings.length} bookings and ${createdPayments.length} payments`);

    // Seed notifications
    console.log('🔔 Seeding notifications...');
    const createdNotifications = [];

    for (const user of createdUsers) {
      // Booking confirmation notifications
      const userBookings = createdBookings.filter(b => b.user.toString() === user._id.toString());
      for (const booking of userBookings.slice(0, 2)) { // Limit to 2 per user
        createdNotifications.push(await Notification.create({
          user: user._id,
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: `Your parking booking for ${booking.parkingSlot} has been confirmed.`,
          data: { bookingId: booking._id },
          isRead: Math.random() > 0.5
        }));
      }

      // Payment notifications
      const userPayments = createdPayments.filter(p => p.user.toString() === user._id.toString());
      for (const payment of userPayments.slice(0, 1)) { // Limit to 1 per user
        createdNotifications.push(await Notification.create({
          user: user._id,
          type: 'payment_successful',
          title: 'Payment Successful',
          message: `Payment of $${payment.amount} has been processed successfully.`,
          data: { paymentId: payment._id },
          isRead: Math.random() > 0.3
        }));
      }

      // Reminder notifications
      if (Math.random() > 0.6) {
        createdNotifications.push(await Notification.create({
          user: user._id,
          type: 'booking_reminder',
          title: 'Booking Reminder',
          message: 'Your parking session ends in 30 minutes. Please extend if needed.',
          data: { bookingId: userBookings[0]?._id },
          isRead: false
        }));
      }
    }
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Seeding Summary:
👨‍💼 Admins: ${createdAdmins.length}
👥 Users: ${createdUsers.length}
🚗 Vehicles: ${createdVehicles.length}
🅿️ Parking Slots: ${createdSlots.length}
📅 Bookings: ${createdBookings.length}
💳 Payments: ${createdPayments.length}
🔔 Notifications: ${createdNotifications.length}

🔐 Admin Login Credentials:
Email: admin@smartparking.com
Password: Admin123!

Email: manager@smartparking.com
Password: Manager123!

👤 Sample User Login Credentials:
Email: john.doe@example.com
Password: Password123!

Email: jane.smith@example.com
Password: Password123!
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeder
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase };