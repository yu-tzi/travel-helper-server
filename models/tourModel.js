const mongoose = require('mongoose');
const todoSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'missing name'] },
  checked: { type: Boolean, default: false },
});

const tourSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('formattedDate').get(function () {
  const formattedDate = new Date(this.date).toLocaleDateString('zh-tw', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  return formattedDate;
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
