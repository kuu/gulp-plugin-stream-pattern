import fs from 'fs';
import path from 'path';
import test from 'ava';
import del from 'del';
import gulp from 'gulp';
import rename from 'gulp-rename';
import {start, end, increment} from './';

const INPUT_FILE_PATH = path.join(__dirname, 'input.json');
const OUTPUT_FILE_NAME = 'output.json';
const OUTPUT_FILE_PATH = path.join(__dirname, OUTPUT_FILE_NAME);

function writeJSON(path, obj) {
  return new Promise((resolve, reject) => {
    try {
      const str = JSON.stringify(obj);
      fs.writeFile(path, str, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function readJSON(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, str) => {
      if (err) {
        reject(err);
      } else {
        try {
          const obj = JSON.parse(str);
          resolve(obj);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

const original = {min: -1001, max: 999, avg: 499, str: 'abc'};
const expected = {min: -1000, max: 1000, avg: 500, str: 'abc'};

test.cb('stream pattern', t => {
  writeJSON(INPUT_FILE_PATH, original)
  .then(() => {
    gulp.src(INPUT_FILE_PATH, {buffer: false})
    .pipe(start())
    .pipe(increment(1))
    .pipe(increment(-1))
    .pipe(increment(1))
    .pipe(end())
    .pipe(rename(OUTPUT_FILE_NAME))
    .pipe(gulp.dest(__dirname))
    .on('finish', () => {
      readJSON(OUTPUT_FILE_PATH)
      .then(actual => {
        t.deepEqual(actual, expected);
        del([INPUT_FILE_PATH, OUTPUT_FILE_PATH])
        .then(() => {
          t.end();
        });
      });
    });
  });
});
