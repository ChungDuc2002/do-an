import { Router } from 'express';

const apiContacts = Router();

import * as contactsController from '../controllers/contactsController.js';

//! GER API------------
apiContacts.get('/getContacts', contactsController.getContacts);

//! POST API------------

apiContacts.post('/createContact', contactsController.createContact);

//! DELETE API------------

apiContacts.delete('/deleteContact/:id', contactsController.deleteContact);

//! PUT API------------
apiContacts.put('/updateContact/:id', contactsController.updateContact);

export default apiContacts;
