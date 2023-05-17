'use strict';

const Plan=require('./plan');
const  usersApi=require('../users/usersApi');
const { body, param, check, validationResult } = require('express-validator');

const dbInterface=require('./plansDbInterface');
const userDbInterface = require('../users/usersDbInterface');
const coursesDbInterface=require('../courses/coursesDbInterface');

const isLoggedIn = (req, res, next) => {
if (req.isAuthenticated()) {
    return next();
}
return res.status(401).json({ error: 'Not authorized' });
}

module.exports.useApi = function useApi(app){

  app.get('/api/plans/:userId', [ isLoggedIn, param('userId').isInt()], async (req, res) => {
  try {

    const userId=req.params.userId;
    if(req.user.id!==+userId){
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (!userId) {
      return res.status(422).json({ error: `validation of plan id failed` });
    }

    const user=userDbInterface.getUserById(userId);
    if(!user){
      return res.status(404).json({ error: `user does not exist\n` });
    }
    const plan = await dbInterface.getPlanByUserId(userId);

    if (!plan) {
      return res.status(404).json({ error: `no plan associated to user id` });
    }

    var retval;
    var coursesListPerPlan= await dbInterface.getCoursesListByUserId(plan.USERID).then(x=> {return x});

    retval={
        "userId": plan.USERID,
        "option": plan.OPTION,
        "minCredits": plan.MINCREDITS,
        "maxCredits": plan.MAXCREDITS,
        "courses": coursesListPerPlan.map(x => x),
    };

    res.status(200).json(retval);

  } catch (err) {
    res.status(500).end(); //generic error
  }
  });

  app.post('/api/plan/:userId',[ isLoggedIn, param('userId').isInt()], async (req, res) => {
    try {

      if(req.user.id!==+req.params.userId){

        return res.status(401).json({ error: 'Not authorized' });
      }

      //check if user exists
      const checkUser = await userDbInterface.getUserById(req.params.userId);
      if(checkUser==='User not found!'){
        return res.status(404).json({error: 'user not found'});
      }

      //check that no study plan has been created yet
      const checkPlan = await dbInterface.getPlanByUserId(checkUser.ID);

      if(checkPlan){
        return res.status(409).json({ error: `user has already created a plan` });
      }

      if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `validation of request body failed` });
      }

      const planToAdd = req.body;
      if (planToAdd === undefined || (planToAdd.option!=="full-time" && planToAdd.option!=="part-time") || !planToAdd.option) {
        return res.status(422).json({ error: `validation of request body failed` });
      }

      //compute nummber of credits per plan
      var minCredits;
      var maxCredits;

      if(planToAdd.option==="full-time"){
        minCredits=60;
        maxCredits=80;
      }else if(planToAdd.option==="part-time"){
        minCredits=20;
        maxCredits=40;
      }
      //store new empty plan
      const result = await dbInterface.storePlan(req.params.userId, planToAdd.option, minCredits, maxCredits);

      return result ? res.status(201).end() : res.status(422).end()

    } catch (err) {
      res.status(503).end(); //generic error
    }
  });

  app.put('/api/plan/:userId', [isLoggedIn, param('userId').isInt()], async (req, res) => {
    try {

      if(req.user.id!==+req.params.userId){
        return res.status(401).json({ error: 'Not authorized' });
      }

      if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `validation of request body failed` });
      }

      const newPlanValues = req.body;
      //controllo che ci sia tutto
      if (newPlanValues === undefined || (newPlanValues.newOption!=="full-time" && newPlanValues.newOption!=="part-time")) {
        return res.status(422).json({ error: `validation of request body failed` });
      }

      //planCheck
      const checkPlan = await dbInterface.getPlanByUserId(req.params.userId);
      if(!checkPlan){
        return res.status(404).json({error: 'plan not found'});
      }
      //check that courses isn't empty
      const newCourses=newPlanValues.newCourses;
      if(newCourses.length<=0){
        return res.status(422).json({ error: `validation of request body failed, number of credits is below minCredits or above maxCredits` });
      }
      var coursesList=[];
      //check courses code and check if they exist
      for(let i=0; i< newCourses.length; i++){
        if(!newCourses[i] || newCourses[i].COURSEID.length!==7){
          return res.status(422).json({ error: `validation of request body failed` });
        }

        const checkCourse = await coursesDbInterface.getCourseByID(newCourses[i].COURSEID);
        if(!checkCourse){
          return res.status(404).json({ error: `one or more selected courses not found` });
        }
        coursesList.push(checkCourse);
      }
      //check course conflicts
      var numCredits=0;
      for(let i=0; i<newCourses.length; i++){
        //incompatible
          const conflictList= await coursesDbInterface.getConflictList(newCourses[i]);

          for(let j=0; j<conflictList.length; j++){

            if(newCourses.find(x=> x.conflictCourses.find(data=>data.CONFLICTCOURSE===conflictList[j])) !== undefined){
              return res.status(422).json({ error: `conflict between courses`});
            }
          }
         //prep course
         if(coursesList[i].PREPCOURSE!==undefined && coursesList[i].PREPCOURSE!==null){
           if(newCourses.find(data=>data.COURSEID===coursesList[i].PREPCOURSE)===undefined){
             return res.status(422).json({ error: `conflict between courses`});
           }
         }
         numCredits+=coursesList[i].CREDITS;
      }

      var minCredits;
      var maxCredits;

      if(newPlanValues.newOption!==checkPlan.OPTION){
        if(newPlanValues.newOption==="part-time"){
          minCredits=20;
          maxCredits=40;
        }else{
          minCredits=60;
          maxCredits=80;
        }
      }else{
        minCredits=checkPlan.MINCREDITS;
        maxCredits=checkPlan.MAXCREDITS;
      }

      if(numCredits<minCredits || numCredits > maxCredits){
        return res.status(422).json({ error: `number of selected credits doesn't meet requirements`});
      }

      await dbInterface.modifyPlan(checkPlan.USERID, newPlanValues.newOption, minCredits, maxCredits);
      //deal with courses per plan

      //check if plan is empty or not
      const courseListPerPlan = await dbInterface.getCoursesListByUserId(checkPlan.USERID);
      var result;

      if(courseListPerPlan.length!==0){
        for(let i=0; i<courseListPerPlan.length; i++){
          await coursesDbInterface.decrementCourseEnrolled(courseListPerPlan[i].COURSEID);
        }
        await dbInterface.deleteCoursesByUserId(checkPlan.USERID);
      }

      for(let i=0; i<newCourses.length; i++){
        await dbInterface.storeCoursesListByUserId(checkPlan.USERID, newCourses[i].COURSEID);
        //not checking on server side if enrolled student is at maximum or not, already checked on server side
        result = await coursesDbInterface.incrementCourseEnrolled(newCourses[i].COURSEID);
      }


      if(result){
        return res.status(200).end();
      }


    } catch (err) {
      res.status(503).end(); //generic error
    }
  });

  app.delete('/api/plans/:userId' ,[ isLoggedIn, param('userId').isInt()], async (req, res) => {
    try {

      if(req.user.id!==+req.params.userId){
        return res.status(401).json({ error: 'Not authorized'});
      }

      const checkPlan = await dbInterface.getPlanByUserId(req.params.userId);
      if(!checkPlan){
        return res.status(404).json({error: 'plan not found'});
      }

      const courseListPerPlan = await dbInterface.getCoursesListByUserId(checkPlan.USERID);
      if(courseListPerPlan.length!==0){
        for(let i=0; i<courseListPerPlan.length; i++){
          //decrementare il numero di enrolled in un corso
          await coursesDbInterface.decrementCourseEnrolled(courseListPerPlan[i].COURSEID);
        }
        await dbInterface.deleteCoursesByUserId(checkPlan.USERID);
      }

      const result= await dbInterface.deletePlan(checkPlan.USERID);
      if(result) {
        return res.status(204).end();
      }

    } catch (err) {
      res.status(503).end(); //generic error
    }
  });


}
