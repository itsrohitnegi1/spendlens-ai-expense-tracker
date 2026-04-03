const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt standard connection first
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('⚠️ Local MongoDB not running. Falling back to in-memory MongoDB...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log(`✅ In-Memory MongoDB Connected: ${mongoUri}`);
      } catch (memError) {
        console.error(`❌ In-Memory MongoDB Connection Error: ${memError.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
