const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('เชื่อมต่อกับ MongoDB สำเร็จ');
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ:', err);
    process.exit(1);
  }
};

module.exports = connectDB;