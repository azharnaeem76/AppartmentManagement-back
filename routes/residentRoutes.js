const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { authorizeRoute } = require('../middlewares/Authentication');


router.use(authorizeRoute("resident"));

router.get("/marquee",residentController.getMarqueeText);
router.get("/bills",residentController.getUserBills);
router.get("/expense",residentController.getUserExpenses);
router.get("/defaulters",residentController.getDefaulters);
router.get("/contacts",residentController.getUnionContacts);
// router.post('/register', residentController.register);
// router.post('/login', residentController.login);
// router.post('/forgot-password', residentController.forgotPassword);
// router.post('/change-password', residentController.changePassword);
// router.delete('/delete-account', residentController.deleteAccount);

module.exports = router;
