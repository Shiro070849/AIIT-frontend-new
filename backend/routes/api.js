const express = require('express');
const router = express.Router();
const YourModel = require('../models/YourModel');

// GET all data
router.get('/data', async (req, res) => {
  try {
    const data = await YourModel.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new data
router.post('/data', async (req, res) => {
  const data = new YourModel({
    field1: req.body.field1,
    field2: req.body.field2
  });

  try {
    const newData = await data.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;