const express = require('express');
const router = express.Router();

const PersonController = require('../controllers/PersonController');
const checkAuth = require('../middleware/check-auth');
const userUpdate = require('../middleware/update-Person');
const checkAdmin = require('../middleware/check-Admin');


router.get('/all', checkAdmin, PersonController.getAllUsers);

router.post('/signup', PersonController.addPerson);

//for updating username, firstName, lastName, email, phoneNumber, imageUrl
router.patch('/update/:personId', checkAuth, userUpdate, PersonController.updatePerson);

//for updating user password
router.patch('/password/:personId', checkAuth, PersonController.updatePersonPassword );

router.delete('/delete/:personId', checkAuth, PersonController.deletePerson);

router.post('/login', PersonController.loginPerson);

module.exports = router;