import { Router } from 'express';
const apiRooms = Router();

import * as roomsController from '../controllers/roomsController.js';

// *GET API
apiRooms.get('/getAllRooms', roomsController.getAllRooms);
apiRooms.get('/getTypeRoom/:type', roomsController.getTypeRoom);
// --------
apiRooms.get('/getRoomsByType', roomsController.getRoomsByType);
apiRooms.get('/getRoomById/:id', roomsController.getRoomById);
apiRooms.get('/search', roomsController.searchRooms);

// *POST API

apiRooms.post('/createRoom', roomsController.createRoom);

// * PUT API
apiRooms.put('/updateRoom/:id', roomsController.updateRoom);

// * DELETE API
apiRooms.delete('/deleteRoom/:id', roomsController.deleteRoom);

export default apiRooms;
