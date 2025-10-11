import usersApi from './apiUsers.js';
import roomsApi from './apiRooms.js';
import favoriteApi from './apiFavorite.js';
import contactApi from './apiContacts.js';
import paymentApi from './apiPayment.js';
import payRoomApi from './apiPayRoom.js';
import statisticalApi from './apiStatistical.js';

export const InitRouters = (app) => {
  app.use('/', usersApi);
  app.use('/room', roomsApi);
  app.use('/api/payos', paymentApi);
  app.use('/favorite', favoriteApi);
  app.use('/payRoom', payRoomApi);
  app.use('/statistical', statisticalApi);
  app.use('/contacts', contactApi);
};
