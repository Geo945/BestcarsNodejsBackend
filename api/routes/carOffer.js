const express = require('express');
const router = express.Router();
const multer = require('multer');//to store images
const { v4: uuidv4 } = require('uuid');

const CarOfferController = require('../controllers/CarOfferController');
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-Admin');

//config multer
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, uuidv4() + file.originalname)
    }
});
//filter to only accept jpeg and png files
const fileFilter = (req, file , cb) => {
    if ( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        //accept file
        cb(null, true);
    }else {
        //reject a file
        cb(new Error('Invalid file'), false);
    }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50 },//limits - limit file size to 5 MB(1024 * 1024 = 1 MB)
    fileFilter: fileFilter
});//this will initialize it
//storage specifies a folder where multer will try to store all the files


router.get('/all', CarOfferController.getAllOffers);

router.post('/add', checkAuth, upload.array('images'), CarOfferController.addCar);

router.patch('/approveAd/:offerId', checkAdmin, CarOfferController.approveAd);

router.delete('/deleteAd/:offerId', checkAuth, CarOfferController.deleteAd);

module.exports = router;