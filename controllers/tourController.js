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
  }
  // TODO: 移除 mock data
  req.userID = 'Udf847f1111801c615bb57897fac44d0d';
  if (!req?.userID) {
    next(
      res
        .status(401)
        .json({ status: 'fail', message: 'check permission fail' }),
    );
  }
  next();
};

exports.createTour = async (req, res) => {
  const data = Object.assign({ userID: req.userID }, req.body);
  try {
    const newTour = await Tour.create(data);
    const tourData = newTour.toObject();
    delete tourData.userID;
    delete tourData.__v;
    res.status(201).json({
      status: 'success',
      data: {
        tour: tourData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTours = async (req, res) => {
  try {
    const tours = await Tour.find({ userID: req.userID }, '-userID -__v');
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tours = await Tour.findOne(
      { userID: req.userID, _id: id },
      '-userID -__v',
    );
    res.status(200).json({
      status: 'success',
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  const { id } = req.params;
  try {
    const validDataKeys = ['date', 'duration', 'priority', 'name'];
    const newData = validDataKeys.reduce((acc, cur) => {
      if (req.body.hasOwnProperty(cur)) {
        acc[cur] = req.body[cur];
      }
      return acc;
    }, {});
    // query, update, options
    const newTour = await Tour.findOneAndUpdate(
      { userID: req.userID, _id: id },
      newData,
      {
        new: true,
        select: '-userID -__v',
        runValidators: true,
        context: 'query',
      },
    );
    res.status(201).json({
      status: 'success',
      data: {
        tours: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
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
