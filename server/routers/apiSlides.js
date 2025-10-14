import { Router } from 'express';

const apiSlides = Router();

import multer from 'multer';

import * as slidesController from '../controllers/slidesController.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

//! Get API------------

apiSlides.get('/getSlides', slidesController.getSlides);
apiSlides.get('/getSlideById/:id', slidesController.getSlideById);

//! Post API----------

apiSlides.post(
  '/uploadSlide',
  upload.single('image'),
  slidesController.uploadSlide
);

//! Delete API--------

apiSlides.delete('/deleteSlide/:id', slidesController.deleteSlide);

//! Put API----------

apiSlides.put(
  '/updateSlide/:id',
  upload.single('image'),
  slidesController.updateSlide
);

export default apiSlides;
