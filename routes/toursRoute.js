const express = require('express');
const {
  getTours,
  createTour,
  getTour,
  deleteTour,
  patchTour,
  createTodo,
  deleteTodo,
  putTodo,
} = require('../controllers/tourController');
const router = express.Router();

router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).delete(deleteTour).patch(patchTour);
router.route('/:id/todo').post(createTodo);
router.route('/:id/todo/:todoId').delete(deleteTodo).put(putTodo);

module.exports = router;
