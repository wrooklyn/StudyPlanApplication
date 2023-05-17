class Course {
    constructor(code, name, credits, enrolledStudents=0, maxStudents = undefined, incompatibleWith=undefined , preparatoryCourse=undefined) {
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.enrolledStudents=enrolledStudents;
        this.maxStudents = maxStudents;
        this.incompatibleWith = incompatibleWith;
        this.preparatoryCourse = preparatoryCourse;
    }
}

module.exports = Course;
