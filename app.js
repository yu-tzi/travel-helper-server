const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const short = require('short-uuid');
const {
  calculateNtdByYen,
  calculateYenByNtd,
} = require('./utils/exchangeDollars');

const app = express();
app.use(express.json());
const translator = short();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// TODO: implement cors on /tour api

const getTours = (req, res) => {
  fs.readFile(`${__dirname}/data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    res.status(200).json({
      status: 'success',
      results: JSON.parse(data).length,
      data: {
        tours: JSON.parse(data),
      },
    });
  });
};

const createTour = (req, res) => {
  const newId = translator.generate();
  const newTour = Object.assign({ id: newId }, req.body);
  // req.body should look like this
  /*
  {
    "timestamp": 1706066106947,
    "name": "六花亭買伴手禮",
    "location": "https://maps.app.goo.gl/n3Nsi8DYhr8iUXcW9",
    "todo": []
  }
  */
  fs.readFile(`${__dirname}/data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const newData = JSON.parse(data);
    newData.push(newTour);
    fs.writeFile(
      `${__dirname}/data/tours.json`,
      JSON.stringify(newData),
      (err) => {
        if (err) {
          console.error(`💥 Error: ${err}`);
        }
        res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });
      },
    );
  });
};

const getTour = (req, res) => {
  const { id } = req.params;
  fs.readFile(`${__dirname}/data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const parsedData = JSON.parse(data);
    const tour = parsedData.find((el) => el.id === id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  });
};

const deleteTour = (req, res) => {
  const { id } = req.params;
  fs.readFile(`${__dirname}/data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const parsedData = JSON.parse(data);
    const newTour = parsedData.filter((el) => el.id !== id);
    fs.writeFile(
      `${__dirname}/data/tours.json`,
      JSON.stringify(newTour),
      (err) => {
        if (err) {
          console.error(`💥 Error: ${err}`);
        }
        res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });
      },
    );
  });
};

const patchTour = (req, res) => {
  const { id } = req.params;
  fs.readFile(`${__dirname}/data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const parsedData = JSON.parse(data);
    const adjustedTour = parsedData.map((el) => {
      if (el.id === id) {
        // req.body should look like this
        /*
        {
          "name": "六花亭買伴手禮",
        }
        */
        return Object.assign(el, req.body);
      }
      return el;
    });
    fs.writeFile(
      `${__dirname}/data/tours.json`,
      JSON.stringify(adjustedTour),
      (err) => {
        if (err) {
          console.error(`💥 Error: ${err}`);
        }
        res.status(201).json({
          status: 'success',
          data: {
            tour: adjustedTour,
          },
        });
      },
    );
  });
};

app.route('/api/v1/tours').get(getTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).delete(deleteTour).patch(patchTour);

//app.route('/api/v1/tours/:id/todos').post(createTodo);
//app.route('/api/v1/tours/:id/todos/:todoId').patch(patchTodo).delete(deleteTodo);

////// start - 串接 line message api 之後改成從 line SDK 輸出結果 //////
const getNtdByYen = async (req, res) => {
  const { yen } = req.body;
  try {
    const ntd = await calculateNtdByYen(yen);
    res.status(200).json({
      result: ntd,
    });
  } catch (e) {
    res.status(404).json({
      result: 'error',
    });
  }
};

const getYenByNtd = async (req, res) => {
  const { ntd } = req.body;
  try {
    const yen = await calculateYenByNtd(ntd);
    res.status(200).json({
      result: yen,
    });
  } catch (e) {
    res.status(404).json({
      result: 'error',
    });
  }
};

app.route('/api/v1/ntd').get(getNtdByYen);
app.route('/api/v1/yen').get(getYenByNtd);
////// end - 串接 line message api 之後改成從 line SDK 輸出結果 //////

app.get('/', (req, res) => {
  res.status(200).send('It works!');
});

module.exports = app;
