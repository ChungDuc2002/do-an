import usersApi from './apiUsers.js';
import roomsApi from './apiRooms.js';
import favoriteApi from './apiFavorite.js';

export const InitRouters = (app) => {
  app.use('/', usersApi);
  app.use('/room', roomsApi);
  app.use('/favorite', favoriteApi);
};
