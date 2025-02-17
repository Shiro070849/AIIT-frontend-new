const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// Get all prompts
router.get('/', async (req, res) => {
  try {
    const prompts = await Prompt.find();
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new prompt set
router.post('/', async (req, res) => {
  const prompt = new Prompt({
    category: req.body.category,
    prompts: req.body.prompts
  });

  try {
    const newPrompt = await prompt.save();
    res.status(201).json(newPrompt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;