const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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
    const arrangedDocument = new APIFeatures(
      Tour.find({}, '-userID -__v'),
      req.query,
      req.userID,
    )
      .filter()
      .sort()
      .paging();
    const toursQuery = arrangedDocument.query;
    // execute query
    const tours = await toursQuery;
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

exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    await Tour.findOneAndDelete({ userID: req.userID, _id: id });
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createTodo = async (req, res) => {
  const id = req.params.id;
  try {
    const newTour = await Tour.findOneAndUpdate(
      { userID: req.userID, _id: id },
      { $push: { todo: req.body } },
      {
        new: true,
        select: '-userID -__v',
        runValidators: true,
        context: 'query',
      },
    );
    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteTodo = async (req, res) => {
  const id = req.params.id;
  const todoId = req.params.todoId;
  try {
    const newTour = await Tour.findOneAndUpdate(
      { userID: req.userID, _id: id },
      { $pull: { todo: { _id: todoId } } },
      {
        new: true,
        select: '-userID -__v',
      },
    );
    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTodo = async (req, res) => {
  const id = req.params.id;
  const todoId = req.params.todoId;
  try {
    const newTour = await Tour.findOneAndUpdate(
      { userID: req.userID, _id: id, 'todo._id': todoId },
      { $set: { 'todo.$': req.body } },
      {
        new: true,
        select: '-userID -__v',
      },
    );
    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const statistics = await Tour.aggregate([
      {
        $match: {
          userID: req.userID,
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          maxDuration: { $max: '$duration' },
          minDuration: { $min: '$duration' },
          todoCount: { $sum: { $size: '$todo' } },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        count: statistics.length,
        stats: statistics,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
