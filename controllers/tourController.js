const fs = require('fs');
const short = require('short-uuid');
const translator = short();
const Tour = require('../models/tourModel');

exports.checkPermission = async (req, res, next) => {
  // 1) 從 client 取得 id token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const lineIdToken = req.headers.authorization.split(' ')[1];
    // 2) 把 token 傳給 line 驗證並得到使用者資料
    const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id_token=${lineIdToken}&client_id=${process.env.LINE_CHANNEL_ID}`,
    });
    const data = await res.json();
    req.userID = data?.sub;
    // something like this "Udf847f1111801c615bb57897fac44d0d"
    if (!req?.userID) {
      next(
        res
          .status(401)
          .json({ status: 'fail', message: 'check permission fail' }),
      );
    }
  }
  next();
};

exports.getTours = (req, res) => {
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
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

exports.createTour = async (req, res) => {
  const id = translator.generate();
  const data = Object.assign({ tour_id: id }, req.body);
  try {
    const newTour = await Tour.create(data);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTour = (req, res) => {
  const { id } = req.params;
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
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

exports.deleteTour = (req, res) => {
  const { id } = req.params;
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const parsedData = JSON.parse(data);
    const newTour = parsedData.filter((el) => el.id !== id);
    fs.writeFile(
      `${__dirname}/../data/tours.json`,
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

exports.patchTour = (req, res) => {
  const { id } = req.params;
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
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
      `${__dirname}/../data/tours.json`,
      JSON.stringify(adjustedTour),
      (err) => {
        if (err) {
          console.error(`💥 Error: ${err}`);
        }
        res.status(201).json({
          status: 'success',
          data: {
            tour: adjustedTour.find((el) => el.id === id),
          },
        });
      },
    );
  });
};

exports.createTodo = (req, res) => {
  const tourId = req.params.id;
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const parsedData = JSON.parse(data);
    // req.body should look like this
    /*
      {
        name: '買夾心餅乾',
        checked: false,
      }
      */
    const newTodo = Object.assign({ id: translator.generate() }, req.body);
    parsedData.find((el) => el.id === tourId).todo.push(newTodo);
    fs.writeFile(
      `${__dirname}/../data/tours.json`,
      JSON.stringify(parsedData),
      (err) => {
        if (err) {
          console.error(`💥 Error: ${err}`);
        }
      },
    );
    res.status(201).json({
      status: 'success',
      data: {
        tour: parsedData.find((el) => el.id === tourId),
      },
    });
  });
};

exports.deleteTodo = (req, res) => {
  const tourId = req.params.id;
  const todoId = req.params.todoId;
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const parsedData = JSON.parse(data);
    const targetTodo = parsedData.find((el) => el.id === tourId).todo;
    const newData = targetTodo.filter((todo) => todo.id !== todoId);
    parsedData.find((el) => el.id === tourId).todo = newData;
    fs.writeFile(
      `${__dirname}/../data/tours.json`,
      JSON.stringify(parsedData),
      (err) => {
        if (err) {
          console.error(`💥 Error: ${err}`);
        }
      },
    );
    res.status(201).json({
      status: 'success',
      data: {
        tour: parsedData.find((el) => el.id === tourId),
      },
    });
  });
};

exports.putTodo = (req, res) => {
  const tourId = req.params.id;
  const todoId = req.params.todoId;
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const parsedData = JSON.parse(data);
    const targetTodo = parsedData.find((el) => el.id === tourId).todo;
    const newData = targetTodo.map((todo) => {
      if (todo.id === todoId) {
        // req.body should look like this
        /*
          {
            name: '買萊姆酒葡萄夾心餅乾',
            checked: true,
          }
          */
        return Object.assign({ id: todo.id }, req.body);
      }
      return todo;
    });
    parsedData.find((el) => el.id === tourId).todo = newData;
    fs.writeFile(
      `${__dirname}/../data/tours.json`,
      JSON.stringify(parsedData),
      (err) => {
        if (err) {
          console.error(`💥 Error: ${err}`);
        }
      },
    );
    res.status(201).json({
      status: 'success',
      data: {
        tour: parsedData.find((el) => el.id === tourId),
      },
    });
  });
};
