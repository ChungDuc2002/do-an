import usersApi from './apiUsers.js';

export const InitRouters = (app) => {
  app.use('/', usersApi);
};
