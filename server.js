const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((_) => {
    console.log('DB connection successful!');
  });

const todoSchema = new mongoose.Schema({
  todo_id: { type: String, required: [true, 'missing id'] },
  name: { type: String, required: [true, 'missing name'] },
  checked: { type: Boolean, required: true },
});

const tourSchema = new mongoose.Schema({
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

const tour = mongoose.model('tour', tourSchema);
/*
const testTour = new tour({
  tour_id: 'pnEPJDXbtkR3BnwA4vTGkL',
  date: 1706083459241,
  duration: 30,
  priority: 5,
  name: '貍小路商店街',
  location: 'https://maps.app.goo.gl/FQ2M2Gep2Eh4x1Ur5',
  todo: [],
});

testTour.save().then(() => {
  console.log('adding success!');
});
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`server is running on port ${PORT}`);
});
