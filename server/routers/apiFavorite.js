import { Router } from 'express';
const apiFavorite = Router();

import * as favoriteController from '../controllers/favoriteController.js';

//! GET API------------
apiFavorite.get('/getFavorites/:userId', favoriteController.getFavorites);

//! POST API------------
apiFavorite.post('/addToFavorite', favoriteController.addToFavorite);

//! DELETE API------------
apiFavorite.delete(
  '/removeFavorite/:userId/:roomId',
  favoriteController.removeFavorite
);

export default apiFavorite;
