const express = require('express');
const router = express.Router();
const { handleWebhookEvent } = require('../models/lineModel');

router.route('/').post((req, res) => {
  Promise.all(req.body.events.map(handleWebhookEvent)).then((result) =>
    res.json(result),
  );
});

module.exports = router;
