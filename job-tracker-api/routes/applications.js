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
    application.statusHistory.push({ status: application.status, date: application.dateApplied });
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
    const application = await Application.findById(req.params.id); // Fetch the current document first

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const statusChanged = req.body.status && req.body.status !== application.status; // Compare before overwriting
    const dateAppliedChanged = req.body.dateApplied &&
      new Date(req.body.dateApplied).getTime() !== new Date(application.dateApplied).getTime(); // Compare before overwriting

    application.set(req.body); // Apply only the fields present in req.body

    if (dateAppliedChanged && application.statusHistory.length > 0) {
      application.statusHistory[0].date = application.dateApplied; // Keep the seed "Applied" entry in sync with a corrected date
    }

    if (statusChanged) {
      application.statusHistory.push({ status: application.status, date: new Date() }); // Log the change
    }

    const saved = await application.save(); // .save() runs full validation automatically — no runValidators option needed
    res.json(saved);
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