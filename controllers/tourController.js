const fs = require('fs');
const short = require('short-uuid');
const translator = short();

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

exports.createTour = (req, res) => {
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
  fs.readFile(`${__dirname}/../data/tours.json`, 'utf-8', (err, data) => {
    if (err) {
      console.error(`💥 Error: ${err}`);
    }
    const newData = JSON.parse(data);
    newData.push(newTour);
    fs.writeFile(
      `${__dirname}/../data/tours.json`,
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
