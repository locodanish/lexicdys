const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// User Routes
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/admin', adminController.toggleAdmin);

// ✅ NEW: Update and Delete Routes
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Content Routes
router.get('/content/:type', adminController.getContent);
router.post('/content', adminController.addContent);
router.put('/content/:type/:id', adminController.updateContent); // <--- ADD THIS LINE
router.delete('/content/:type/:id', adminController.deleteContent);

module.exports = router;