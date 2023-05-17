function Course (code, name, credits, enrolledStudents=0, maxStudents = null, incompatibleWith=null, preparatoryCourse=null) {

    this.code = code;
    this.name = name;
    this.credits = credits;
    this.enrolledStudents=enrolledStudents;
    this.maxStudents=maxStudents; 
    this.incompatibleWith = incompatibleWith;
    this.preparatoryCourse = preparatoryCourse;
  }

export default Course;
