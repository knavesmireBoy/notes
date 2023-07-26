/*var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
*/
import { default as express } from 'express';
export const router = express.Router();

router.get('/', async (req, res, next) => {
//... placeholder for Notes home page code
res.render('index', { title: 'Notes' });
});