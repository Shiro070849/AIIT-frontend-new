// scripts/seedPrompts.js
require('dotenv').config();
const mongoose = require('mongoose');
const Prompt = require('../models/Prompt');

const promptSets = [
    {
        category: 'ฮาร์ดแวร์',
        prompts: [
            { text: 'ส่วนประกอบของคอมพิวเตอร์มีอะไรบ้าง', icon: 'compass_icon' },
            { text: 'ทำไมหน้าคอมพิวเตอร์ถึงเปิดไม่ติดทั้งๆที่กดเปิดเครื่องไปแล้ว', icon: 'bulb_icon' },
            // ... ข้อมูลอื่นๆ
        ]
    },
    {
        category: 'ซอฟต์แวร์',
        prompts: [
            { text: 'การ์ดจอคืออะไรและมีหน้าที่อะไร', icon: 'compass_icon' },
            // ... ข้อมูลอื่นๆ
        ]
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Prompt.deleteMany({}); // ล้างข้อมูลเก่า
        await Prompt.insertMany(promptSets);
        console.log('เพิ่มข้อมูลสำเร็จ');
        process.exit();
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        process.exit(1);
    }
};

seedDatabase();