var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('idid' + req.param('id'));
});

module.exports = router;
