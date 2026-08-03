const express = require('express');
const router = express.Router(); // router object
const Application = require('../models/Application'); // Import the Application model

router.get('/', async (req, res) => { // GET route to fetch all applications
  try {
    const applications = await Application.find(); // Query to Application
    res.json(applications); // Response with the applications in JSON format
  } catch (err) { // error handling
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => { // POST route to create a new application
  try {
    const application = new Application(req.body); // Create a new Application instance with the request body
    const saved = await application.save(); // Save the application to the database
    res.status(201).json(saved); // Respond with the saved application and a 201 status code
  } catch (err) { // error handling
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => { // GET route to fetch a single application by ID
  try {
    const application = await Application.findById(req.params.id); // Query to find the application by ID
    if (!application) {
      return res.status(404).json({ error: 'Application not found' }); // If not found, respond with a 404 status code and an error message
    }
    res.json(application); // Respond with the found application in JSON format
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => { // PUT route to update an application by ID
  try {
    const application = await Application.findByIdAndUpdate( // Update call
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true } // options to return the updated document and run validators, changed from new to returnDocument as new is being depricated
    );
    if (!application) {
      return res.status(404).json({ error: 'Application not found' }); // If not found, respond with a 404 status code and an error message
    }
    res.json(application);
  } catch (err) { // error handling
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted', application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // export the router for use in server.js