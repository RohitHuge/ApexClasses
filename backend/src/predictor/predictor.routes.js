import express from 'express';
import * as PredictorController from './predictor.controller.js';

const router = express.Router();

// Public endpoints — global generalLimiter (app.js) already applies.
router.get('/meta', PredictorController.getMeta);
router.post('/predict', PredictorController.predict);

export default router;
