const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

/*
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
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`server is running on port ${PORT}`);
});
