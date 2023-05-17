const sqlite=require('sqlite3');
const Course = require('./course');

const RunningDb = require('../runningDb');
const db = RunningDb.getDb();

module.exports.getAllCourses = function getAllCourses() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM COURSES';
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

module.exports.getConflictList = function getConflictList(code) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT CONFLICTCOURSE AS CONFLICTCOURSE FROM INCOMPATIBLE WHERE MAINCOURSE=?';
        db.all(sql, [code], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

module.exports.getCourseByID = function getCourseByID(code) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM COURSES WHERE CODE=?';
        db.get(sql, [code], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) { resolve(false); }
            else {
                resolve(row);
            }
        });
    });
}

module.exports.incrementCourseEnrolled = function incrementCourseEnrolled(courseId) {

  return new Promise((resolve, reject) => {

    const sql = 'UPDATE COURSES ' +
      'SET ENROLLEDSTUDENTS=ENROLLEDSTUDENTS+1 ' +
      'WHERE CODE=?';
    db.run(sql, [courseId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    })
  })
}

module.exports.decrementCourseEnrolled = function decrementCourseEnrolled(courseId) {

  return new Promise((resolve, reject) => {

    const sql =  `UPDATE COURSES SET ENROLLEDSTUDENTS=ENROLLEDSTUDENTS-1 WHERE CODE=? AND ENROLLEDSTUDENTS>0`;
    db.run(sql, [courseId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    })
  })
}
