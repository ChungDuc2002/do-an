import { Router } from 'express';
const apiUsers = Router();

import * as usersController from '../controllers/usersController.js';
import * as middlewareController from '../middlewares/middlewareControllers.js';

// * GET API

apiUsers.get(
  '/getAllUsers',
  middlewareController.verifyToken,
  usersController.getAllUsers
);
apiUsers.get('/getUser/:id', usersController.getUserById);
apiUsers.get('/searchUser', usersController.searchUserByName);
apiUsers.get('/info', middlewareController.verifyToken, usersController.info);

// * POST API
apiUsers.post('/login', usersController.Login);
apiUsers.post('/register', usersController.Register);
apiUsers.post('/createUser', usersController.createUser);

// * PUT API
apiUsers.put('/updateUser/:id', usersController.updateUser);

// * DELETE API
apiUsers.delete('/deleteUser/:id', usersController.deleteUser);

export default apiUsers;
