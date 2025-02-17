const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const dbOptions = {
    dbName: 'datachatbot',
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 60000
};

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, dbOptions);
        console.log('เชื่อมต่อ MongoDB สำเร็จ');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

connectDB();

// Schema - ปรับให้ตรงกับข้อมูลใน MongoDB
const promptSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: String,
    text: String
}, { 
    collection: 'prompt',
    strict: false
});

const Prompt = mongoose.model('Prompt', promptSchema);

// เพิ่ม Schema และ Model สำหรับ userprompt collection
const userPromptSchema = new mongoose.Schema({
  text: String
}, { 
  collection: 'userprompt',
  strict: false
});

const UserPrompt = mongoose.model('UserPrompt', userPromptSchema);

// API endpoint เดิม
app.get('/prompt', async (req, res) => {
    try {
        console.log('Attempting to fetch prompts...');
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }

        const prompts = await Prompt.find().select('-__v');
        console.log('Found prompts:', prompts);
        res.json(prompts);
    } catch (error) {
        console.error('Error fetching prompts:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            readyState: mongoose.connection.readyState
        });
    }
});

// API endpoint ใหม่สำหรับดึงข้อมูลที่จัดกลุ่มแล้ว
app.get('/api/prompts', async (req, res) => {
    try {
        const prompts = await Prompt.find().select('-__v');
        
        // จัดกลุ่มข้อมูลตาม type
        const groupedPrompts = prompts.reduce((acc, prompt) => {
            const type = prompt.type;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push({
                id: prompt._id,
                text: prompt.text,
                icon: 'message_icon'
            });
            return acc;
        }, {});

        // แปลงเป็นรูปแบบที่ frontend ต้องการ
        const formattedPrompts = Object.entries(groupedPrompts).map(([category, prompts]) => ({
            category,
            prompts
        }));

        res.json(formattedPrompts);
    } catch (error) {
        console.error('Error fetching grouped prompts:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// เพิ่ม API endpoint ใหม่สำหรับบันทึกข้อความจากผู้ใช้
app.post('/api/userprompt', async (req, res) => {
  try {
    const { text } = req.body;
    const userPrompt = new UserPrompt({ text });
    await userPrompt.save();
    res.status(201).json(userPrompt);
  } catch (error) {
    console.error('Error saving user prompt:', error);
    res.status(500).json({ error: 'Failed to save user prompt' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'เกิดข้อผิดพลาดบางอย่าง!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// สร้าง prompt ใหม่
app.post('/api/admin/prompts', async (req, res) => {
    try {
        const { type, text } = req.body;
        
        if (!type || !text) {
            return res.status(400).json({ error: 'ต้องระบุหมวดหมู่และคำถาม' });
        }

        const prompt = new Prompt({
            _id: new mongoose.Types.ObjectId(),
            type,
            text
        });

        await prompt.save();
        res.status(201).json(prompt);
    } catch (error) {
        console.error('Error creating prompt:', error);
        res.status(500).json({ error: 'ไม่สามารถเพิ่มคำถามได้' });
    }
});

// ลบ prompt
app.delete('/api/admin/prompts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Prompt.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ error: 'ไม่พบคำถามที่ต้องการลบ' });
        }
        
        res.json({ message: 'ลบคำถามสำเร็จ' });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        res.status(500).json({ error: 'ไม่สามารถลบคำถามได้' });
    }
});

// แก้ไข prompt
app.put('/api/admin/prompts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, text } = req.body;

        if (!type || !text) {
            return res.status(400).json({ error: 'ต้องระบุหมวดหมู่และคำถาม' });
        }

        const updatedPrompt = await Prompt.findByIdAndUpdate(
            id,
            { type, text },
            { new: true }
        );

        if (!updatedPrompt) {
            return res.status(404).json({ error: 'ไม่พบคำถามที่ต้องการแก้ไข' });
        }

        res.json(updatedPrompt);
    } catch (error) {
        console.error('Error updating prompt:', error);
        res.status(500).json({ error: 'ไม่สามารถแก้ไขคำถามได้' });
    }
});

app.get('/api/userprompt', async (req, res) => {
    try {
        const userPrompts = await UserPrompt.find()
            .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
            .limit(100); // จำกัดจำนวนที่ดึงมา
        res.json(userPrompts);
    } catch (error) {
        console.error('Error fetching user prompts:', error);
        res.status(500).json({ error: 'Failed to fetch user prompts' });
    }
});

app.delete('/api/userprompt/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserPrompt.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ error: 'ไม่พบคำถามที่ต้องการลบ' });
        }
        
        res.json({ message: 'ลบคำถามสำเร็จ' });
    } catch (error) {
        console.error('Error deleting user prompt:', error);
        res.status(500).json({ error: 'ไม่สามารถลบคำถามได้' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});