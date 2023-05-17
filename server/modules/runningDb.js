'use strict';

const sqlite = require('sqlite3');
const dbname = "Plan.sqlite3"
const db = new sqlite.Database(dbname, (err) => {
    if (err) throw err;
});

module.exports.getDb = function getDb() {
    return db;
}

module.exports.createAll = function createAll() {
    newUsers();
    newCourses();
    newPlans();
    newIncompatible();
    newCoursesPerPlan();

}

function newUsers() {
    return new Promise((resolve, reject) => {
        const sql = 'CREATE TABLE IF NOT EXISTS USERS' +
            '(ID INTEGER PRIMARY KEY NOT NULL, EMAIL VARCHAR NOT NULL, NAME VARCHAR NOT NULL, HASH VARCHAR NOT NULL, SALT VARCHAR NOT NULL)';
        db.run(sql, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve('done');
        });
    });
}

function newCourses() {
    return new Promise((resolve, reject) => {
        const sql = 'CREATE TABLE IF NOT EXISTS COURSES' +
            '(CODE VARCHAR PRIMARY KEY NOT NULL, NAME VARCHAR NOT NULL, CREDITS INTEGER NOT NULL, MAXSTUDENTS INTEGER, PREPCOURSE VARCHAR)';
        db.run(sql, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve('done');
        });
    });
}

function newPlans() {
    return new Promise((resolve, reject) => {
        const sql = 'CREATE TABLE IF NOT EXISTS PLANS' +
            '(USERID INTEGER PRIMARY KEY,' +
            'OPTION VARCHAR NOT NULL,' +
            'MINCREDITS INTEGER NOT NULL,' +
            'MAXCREDITS INTEGER NOT NULL,' +
            'FOREIGN KEY(USERID) REFERENCES USERS(ID) ON UPDATE CASCADE)' ;
        db.run(sql, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve('done');
        });
    });
}

function newIncompatible() {
    return new Promise((resolve, reject) => {
        const sql = 'CREATE TABLE IF NOT EXISTS INCOMPATIBLE' +
            '(ID INTEGER PRIMARY KEY AUTOINCREMENT,' +
            'MAINCOURSE VARCHAR NOT NULL,' +
            'CONFLICTCOURSE VARCHAR NOT NULL,' +
            'FOREIGN KEY(MAINCOURSE) REFERENCES COURSES(CODE) ON UPDATE CASCADE,' +
            'FOREIGN KEY(CONFLICTCOURSE) REFERENCES COURSES(CODE) ON UPDATE CASCADE)' ;
        db.run(sql, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve('done');
        });
    });
}

function newCoursesPerPlan(){
    return new Promise((resolve, reject) => {
        const sql = 'CREATE TABLE IF NOT EXISTS COURSESPERPLAN' +
            '(ID INTEGER PRIMARY KEY AUTOINCREMENT,' +
            'USERID INTEGER NOT NULL,' +
            'COURSEID VARCHAR NOT NULL,' +
            'FOREIGN KEY(USERID) REFERENCES PLANS(USERID) ON UPDATE CASCADE ON DELETE CASCADE,' +
            'FOREIGN KEY(COURSEID) REFERENCES COURSES(CODE) ON UPDATE CASCADE)' ;
        db.run(sql, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve('done');
        });
    });
}
