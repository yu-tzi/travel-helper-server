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
  checkPermission,
} = require('../controllers/tourController');
const router = express.Router();

router
  .route('/')
  .get(checkPermission, getTours)
  .post(checkPermission, createTour);
router
  .route('/:id')
  .get(checkPermission, getTour)
  .delete(checkPermission, deleteTour)
  .patch(checkPermission, patchTour);
router.route('/:id/todo').post(checkPermission, createTodo);
router
  .route('/:id/todo/:todoId')
  .delete(checkPermission, deleteTodo)
  .put(checkPermission, putTodo);

module.exports = router;
