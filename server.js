require('dotenv').config();
const app = require('./app');

console.log(process.env.NODE_ENV);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`server is running on port ${PORT}`);
});
