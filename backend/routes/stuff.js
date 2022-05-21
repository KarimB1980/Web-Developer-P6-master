const express = require('express');
const router = express.Router();

const stuffCtrl = require('../controllers/stuff');

router.get('/api/sauces', stuffCtrl.getAllSauces);
router.get('/api/sauces/:id', stuffCtrl.getOneSauce);
router.post('/api/sauces', stuffCtrl.createImageSauce);
router.put('/api/sauces/:id', stuffCtrl.modifySauce);
router.delete('/api/sauces/:id', stuffCtrl.deleteSauce);
router.post('/api/sauces/:id/like', stuffCtrl.createLike);

module.exports = router;