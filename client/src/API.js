import Course from './components/course/Course';
import Plan from './components/plan/Plan';
const SERVER_URL = 'http://localhost:3001';

const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    return false;
    //throw user;  // an object with the error coming from the server
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const getAllCourses = async () => {
  const response = await fetch(SERVER_URL + '/api/courses', {credentials: 'include'});
  const coursesJson = await response.json();
  if(response.ok) {
    return coursesJson;
  }
  else {
    console.log('err');
    throw coursesJson;
  }
};

const getCourseByID = async (code) => {
    const response = await fetch(`${SERVER_URL}/api/courses/${code}`, {method: 'GET', credentials: 'include'});
    const courseJson = await response.json();
    if(response.ok){
      return new Course(courseJson.code, courseJson.name, courseJson.cfu, courseJson.enrolledStudents, courseJson.maxStudents, courseJson.incompatibleWith, courseJson.preparatoryCourse);
    }else {
      console.log('err');
      throw courseJson;
    }
}

const getPlanByUserId = async (userId) => {
  const response = await fetch(`${SERVER_URL}/api/plans/${userId}`, {method: 'GET', credentials: 'include'});
  const planJson = await response.json();
  if(response.ok){
    return new Plan(planJson.userId, planJson.option, planJson.minCredits, planJson.maxCredits, planJson.courses);
  }else{
    return false;
  }
}

const storePlan = async (option, userId) => {

  const response = await fetch(SERVER_URL +  `/api/plan/${userId}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({option: option})
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else return true;
  // add other error handling
}

const modifyPlan = async (newOption, newCourses, userId) => {

  const response = await fetch(SERVER_URL + '/api/plan/' + userId, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({newOption: newOption, newCourses: newCourses})
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else return true;
  // add other error handling
}

const deletePlan = async(userId) => {
  const response = await fetch(SERVER_URL + `/api/plans/${userId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return true;
}
const API = {logIn, getUserInfo, logOut, getAllCourses, getCourseByID, getPlanByUserId, storePlan, modifyPlan, deletePlan};
export default API;
