const todoSchema = new mongoose.Schema({
  todo_id: { type: String, required: [true, 'missing id'] },
  name: { type: String, required: [true, 'missing name'] },
  checked: { type: Boolean, required: true },
});

exports.tourSchema = new mongoose.Schema({
  tour_id: { type: String, required: [true, 'missing id'] },
  date: { type: Date, required: [true, 'missing date'] },
  duration: { type: Number, required: [true, 'missing time'] },
  priority: {
    type: Number,
    required: [true, 'missing priority'],
    min: 1,
    max: 5,
  },
  name: { type: String, required: [true, 'missing name'] },
  location: { type: String, required: [true, 'missing location'] },
  todo: { type: [todoSchema], default: [] },
});
