const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/database');

const cleanupDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const db = mongoose.connection.db;

    // Remove cityId field from all cities
    await db.collection('cities').updateMany(
      { cityId: { $exists: true } },
      { $unset: { cityId: 1 } }
    );
    console.log('✅ Cleaned cityId from cities');

    // Remove pincodeId field from all pincodes
    await db.collection('pincodes').updateMany(
      { pincodeId: { $exists: true } },
      { $unset: { pincodeId: 1 } }
    );
    console.log('✅ Cleaned pincodeId from pincodes');

    // Remove areaId field from all areas
    await db.collection('areas').updateMany(
      { areaId: { $exists: true } },
      { $unset: { areaId: 1 } }
    );
    console.log('✅ Cleaned areaId from areas');

    // Remove locationId field from all locations
    await db.collection('locations').updateMany(
      { locationId: { $exists: true } },
      { $unset: { locationId: 1 } }
    );
    console.log('✅ Cleaned locationId from locations');

    // Remove Counter collection if it exists
    try {
      await db.collection('counters').deleteMany({});
      console.log('✅ Cleared counters collection');
    } catch (e) {
      console.log('⚠️ Counters collection not found, skipping');
    }

    console.log('\n✅ Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};

cleanupDatabase();
