const mongoose = require('mongoose');
const todoSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'missing name'] },
  checked: { type: Boolean, required: true },
});

const tourSchema = new mongoose.Schema({
  userID: { type: String, required: [true, 'missing userID'] },
  date: { type: Date, required: [true, 'missing date'] },
  duration: { type: Number, required: [true, 'missing time'] },
  priority: {
    type: Number,
    required: [true, 'missing priority'],
    min: 1,
    max: 5,
  },
  name: { type: String, required: [true, 'missing name'] },
  location: { type: String },
  todo: { type: [todoSchema], default: [] },
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
