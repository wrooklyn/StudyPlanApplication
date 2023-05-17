'use strict';

const Course=require('./course');
const dbInterface=require('./coursesDbInterface')
const { body, param, check, validationResult } = require('express-validator');

module.exports.useApi = function useApi(app){

  app.get('/api/courses', async (req, res) => {
    try {
        // 200 Ok (success)
        const courseList = await dbInterface.getAllCourses();
        var retval=[];

        for (var r of courseList){
          var conflictList= await dbInterface.getConflictList(r.CODE).then(x=> {return x});
          retval.push({
              "code": r.CODE,
              "name": r.NAME,
              "cfu": r.CREDITS,
              "enrolledStudents": r.ENROLLEDSTUDENTS,
              "maxStudents": r.MAXSTUDENTS,
              "incompatibleWith": conflictList.map(x => x.CONFLICTCOURSE),
              "preparatoryCourse": r.PREPCOURSE
          })
        }

        return res.status(200).json(retval);

    } catch (err) {
        // 500 Internal Server Error
        return res.status(500).end();
    }
  });

  app.get('/api/courses/:code', async (req, res) => {
  try {

    const code=req.params.code;
    if (!code || code.length!==7 ) {
      return res.status(422).json({ error: `validation of course code failed` });
    }

    const course = await dbInterface.getCourseByID(code);

    if (!course) {
      return res.status(404).json({ error: `no course associated to course code` });
    }

    var retval;
    var conflictList= await dbInterface.getConflictList(course.CODE).then(x=> {return x});
    retval={
        "code": course.CODE,
        "name": course.NAME,
        "cfu": course.CREDITS,
        "enrolledStudents": course.ENROLLEDSTUDENTS,
        "maxStudents": course.MAXSTUDENTS,
        "incompatibleWith": conflictList.map(x => x.CONFLICTCOURSE),
        "preparatoryCourse": course.PREPCOURSE
    };

    res.status(200).json(retval);

  } catch (err) {
    res.status(500).end(); //generic error
  }
  });

}
