const router = require('express').Router();

router.use('/auth',     require('./auth'));
router.use('/monitors', require('./monitors'));
router.use('/admin',    require('./admin'));
router.use('/contact',  require('./contact'));

router.get('/status', (req, res) => {
  res.json({ service: 'Gifted Monitor', status: 'running', uptime: Math.floor(process.uptime()) });
});

router.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = router;
