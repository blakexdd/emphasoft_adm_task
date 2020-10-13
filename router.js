const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.json(req.user);
});

module.exports.router = router;