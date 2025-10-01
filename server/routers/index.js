import usersApi from './apiUsers.js';
import roomsApi from './apiRooms.js';

export const InitRouters = (app) => {
  app.use('/', usersApi);
  app.use('/room', roomsApi);
};
