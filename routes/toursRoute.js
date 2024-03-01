const express = require('express');
const {
  getTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  createTodo,
  deleteTodo,
  updateTodo,
  checkPermission,
  getStatistics,
} = require('../controllers/tourController');
const router = express.Router();

router.route('/stats').get(checkPermission, getStatistics);
router
  .route('/')
  .get(checkPermission, getTours)
  .post(checkPermission, createTour);
router
  .route('/:id')
  .get(checkPermission, getTour)
  .delete(checkPermission, deleteTour)
  .patch(checkPermission, updateTour);
router.route('/:id/todo').post(checkPermission, createTodo);
router
  .route('/:id/todo/:todoId')
  .delete(checkPermission, deleteTodo)
  .put(checkPermission, updateTodo);
module.exports = router;
