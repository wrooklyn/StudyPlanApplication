const sqlite=require('sqlite3');
const Plan = require('./plan');

const RunningDb = require('../runningDb');
const db = RunningDb.getDb();
const coursesDbInterface=require('../courses/coursesDbInterface');

module.exports.storePlan = function storePlan(userId, option, minCredits, maxCredits) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO PLANS(USERID, OPTION, MINCREDITS, MAXCREDITS) VALUES(?,?,?,?)';
        db.run(sql, [userId, option, minCredits, maxCredits], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

module.exports.modifyPlan = function modifyPlan(userId, newOption, minCredits, maxCredits) {

  return new Promise((resolve, reject) => {

    const sql = 'UPDATE PLANS ' +
      'SET OPTION=?, MINCREDITS=?, MAXCREDITS=? ' +
      'WHERE USERID=?';
    db.run(sql, [newOption, minCredits, maxCredits, userId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    })
  })
}

module.exports.getPlanByUserId = function getPlanByUserId(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM PLANS WHERE USERID=?';
        db.get(sql, [userId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) { resolve(false); }
            else {
                resolve(row);
            }
        });
    });
}

module.exports.getPlanCredits = function getPlanCredits(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT SUM(COURSES.CREDITS) AS TOTCREDITS, PLANS.MAXCREDITS AS MAXCREDITS FROM COURSES, PLANS WHERE COURSES.CODE IN (SELECT COURSEID FROM COURSESPERPLAN WHERE COURSESPERPLAN.USERID=?) AND PLANS.USERID=?';
        db.get(sql, [userId, userId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) { resolve(false); }
            else {
                resolve(row);
            }
        });
    });
}

module.exports.getCoursesListByUserId  = function getCoursesListByUserId(userId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COURSEID AS COURSEID, CREDITS AS CREDITS, NAME AS NAME, PREPCOURSE AS PREPCOURSE
                     FROM COURSESPERPLAN, COURSES
                     WHERE COURSESPERPLAN.USERID=? AND COURSES.CODE=COURSESPERPLAN.COURSEID`;
        db.all(sql, [userId],async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            await Promise.all(rows.map(async (c)=>Object.assign(c, {conflictCourses: await coursesDbInterface.getConflictList(c.COURSEID)})));
            resolve(rows);
        });
    });
}

module.exports.storeCoursesListByUserId = function storeCoursesListByUserId (userId, courseId) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO COURSESPERPLAN(USERID, COURSEID) VALUES(?,?)';
        db.run(sql, [userId, courseId], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

module.exports.deleteCoursesByUserId = function deleteCoursesByUserId(userId) {

    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM COURSESPERPLAN WHERE USERID=?';
        db.run(sql, [userId], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

module.exports.deletePlan = function deletePlan(userId) {

    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM PLANS WHERE USERID=?';
        db.run(sql, [userId], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
