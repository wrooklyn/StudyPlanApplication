function Plan (userId, option, minCredits, maxCredits, courses=null) {

  this.userId = userId;
  this.option = option;
  this.minCredits = minCredits;
  this.maxCredits = maxCredits;
  this.courses = courses;

  }

export default Plan;
