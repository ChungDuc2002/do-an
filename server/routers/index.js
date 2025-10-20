import usersApi from './apiUsers.js';
import roomsApi from './apiRooms.js';
import slidesApi from './apiSlides.js';
import favoriteApi from './apiFavorite.js';
import contactApi from './apiContacts.js';
import paymentApi from './apiPayment.js';
import payRoomApi from './apiPayRoom.js';
import statisticalApi from './apiStatistical.js';
import chatApi from './apiChat.js';

export const InitRouters = (app) => {
  app.use('/', usersApi);
  app.use('/slides', slidesApi);
  app.use('/room', roomsApi);
  app.use('/api/payos', paymentApi);
  app.use('/favorite', favoriteApi);
  app.use('/payRoom', payRoomApi);
  app.use('/statistical', statisticalApi);
  app.use('/contacts', contactApi);
  app.use('/chat', chatApi);
};
