import { Router } from 'express';
const apiFavorite = Router();

import * as favoriteController from '../controllers/favoriteController.js';

//! GET API------------
apiFavorite.get('/getFavorites/:userId', favoriteController.getFavorites);
apiFavorite.get('/checkFavorite', favoriteController.checkFavorite); // check favorite

//! POST API------------
apiFavorite.post('/addToFavorite', favoriteController.addToFavorite);

//! DELETE API------------
apiFavorite.delete(
  '/removeFavorite/:userId/:roomId',
  favoriteController.removeFavorite
);
apiFavorite.delete(
  '/removeFromFavorite',
  favoriteController.removeFromFavorite
);

export default apiFavorite;
