const through = require('through2');
const util = require('gulp-util');

function createPluginError(message) {
  return new util.PluginError('gulp-plugin-stream-pattern', message);
}

function buffer2json(input) {
  const stream = through.obj(function (buffer, enc, cb) {
    setImmediate(() => {
      try {
        this.push(JSON.parse(buffer.toString()));
        cb();
      } catch (err) {
        cb(createPluginError(`An error occurred at ${err.stack}`));
      }
    });
  });
  return input.pipe(stream);
}

function json2buffer(input) {
  const stream = through.obj(function (jsonObj, enc, cb) {
    setImmediate(() => {
      try {
        this.push(JSON.stringify(jsonObj));
        cb();
      } catch (err) {
        cb(createPluginError(`An error occurred at ${err.stack}`));
      }
    });
  });
  return input.pipe(stream);
}

function incrementEachProperty(input, num = 1) {
  const stream = through.obj(function (obj, enc, cb) {
    setImmediate(() => {
      Object.keys(obj).forEach(key => {
        if (Number.isInteger(obj[key])) {
          obj[key] += num;
        }
      });
      this.push(obj);
      cb();
    });
  });
  return input.pipe(stream);
}

// Returns a gulp-plugin that converts a file to an object.
function start() {
  return through.obj(function (file, enc, cb) {
    console.log(`start: Received a vynil. path = ${file.path}`);
    if (file.isNull()) {
      cb(null, file);
    } else if (file.isBuffer()) {
      cb(createPluginError('Buffer not supported'));
    } else {
      file.contents = buffer2json(file.contents)
      .once('finish', () => {
        console.log('start finished');
        cb();
      });
      this.push(file);
    }
  });
}

// Returns a gulp-plugin that converts an object to a file.
function end() {
  return through.obj(function (file, enc, cb) {
    console.log(`end: Received a vynil. path = ${file.path}`);
    if (file.isNull()) {
      cb(null, file);
    } else if (file.isBuffer()) {
      cb(createPluginError('Buffer not supported'));
    } else {
      file.contents = json2buffer(file.contents)
      .once('finish', () => {
        console.log('end finished');
        cb();
      });
      this.push(file);
    }
  });
}

// Returns a gulp-plugin that increments each property in an object.
function increment(num) {
  return through.obj(function (file, enc, cb) {
    console.log(`increment: Received a vynil. path = ${file.path}`);
    if (file.isNull()) {
      cb(null, file);
    } else if (file.isBuffer()) {
      cb(createPluginError('Buffer not supported'));
    } else {
      file.contents = incrementEachProperty(file.contents, num)
      .once('finish', () => {
        console.log('increment finished');
        cb();
      });
      this.push(file);
    }
  });
}

module.exports = {start, end, increment};
