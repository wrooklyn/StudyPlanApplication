import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Table, ListGroup, Popover, OverlayTrigger} from 'react-bootstrap';
import { useState, useEffect } from 'react';

function Courses(props) {
    return (
        <Col>
            <Row>
                <div className="container-fluid myTable">
                    <CourseTable courses={props.courses} formEdit={props.formEdit} editCourses={props.editCourses} setEditCourses={props.setEditCourses} ></CourseTable>
                </div>
            </Row>

        </Col>
    );
}

function CourseTable(props) {
    return (
        <Table hover className="table">
            <thead className="tableHeader">
              <tr>
                <th style={{width:'17%'}}>CODE</th>
                <th style={{width:'32%'}}>NAME</th>
                <th style={{width:'4%'}}>INFO</th>
                <th style={{width:'16%'}}>CREDITS</th>
                <th style={{width:'10%'}}>MAX</th>
                <th style={{width:'16%'}}>ENROLLED</th>
                {props.formEdit && <th style={{width:'6%'}}></th>}
              </tr>
            </thead>
            <tbody>
                {
                  props.courses.map((c, index) => <CourseRow key={index} course={c} formEdit={props.formEdit} editCourses={props.editCourses} setEditCourses={props.setEditCourses}/>)
                }
            </tbody>
        </Table>
    );
}

function CourseRow(props) {
  const [show, setShow] = useState(false);
  const [popOverMessage, setPopOverMessage]=useState('');
  const [conflictColor, setConflictColor]=useState(false);
  const [addedColor, setAddedColor]=useState(false);
    useEffect(() => {
        setConflictColor(false);
        setAddedColor(false);
        var obj;
        if(props.editCourses!==undefined && props.editCourses.length>0){
        for(let j=0; j<props.course.incompatibleWith.length; j++){
          obj = props.editCourses.find(data=>data.COURSEID===props.course.incompatibleWith[j]);
          if(obj!==undefined){
            setConflictColor(true);
          }
        }
        if(props.course.preparatoryCourse!==null){
        obj=props.editCourses.find(data=>data.COURSEID===props.course.preparatoryCourse);
        if(obj===undefined){
          setConflictColor(true);
        }
        }
        obj=props.editCourses.find(data=>data.COURSEID===props.course.code);
        if(obj){
          setAddedColor(true);
        }else{
          setAddedColor(false);
        }
      }
    }, [props.editCourses]);

  const addCourse=async(courseId)=>{

      if(props.editCourses.find(data=>data.COURSEID===courseId)){
          setPopOverMessage('Course already in the plan!');

      }else if(props.course.maxStudents==props.course.enrolledStudents){
            setPopOverMessage('Course already full!')
      }else{
              //check if there are any conflict with the courses that are already added
              let obj = props.editCourses.find(x=> x.conflictCourses.find(data=>data.CONFLICTCOURSE===courseId));
              //let obj = props.editCourses.find(x=> x.conflictCourses.includes(courseId));

              let prep=false;

              //check if the course we want to add needs a prep course and if so, check that prep course is already in the study plan
              if(props.course.preparatoryCourse){ //prep course needed
                let flag=props.editCourses.find(data=>data.COURSEID===props.course.preparatoryCourse); // prepcourse IS already in the study plan
                if(!flag){
                  prep=true; //cannot add
                }
              }

              if(obj!==undefined || prep){ //if there's a conflict OR there's a prep course needed
                if(obj){
                  const msg="["+props.course.code+"] cannot be added because it goes in conflict with ["+obj.COURSEID+"]";
                  setPopOverMessage(msg);
                }
                if(prep){
                  const msg="["+props.course.code+"] cannot be added because it needs the preparatory course ["+props.course.preparatoryCourse+"]";
                  setPopOverMessage(msg);
                  prep=false;
               }
             }else if(obj===undefined && prep===false){

               let array=[];

               for(let i=0; i<props.course.incompatibleWith.length; i++){
                 array=[...array, {CONFLICTCOURSE: props.course.incompatibleWith[i]}];
               }
              //  let conflict=props.course.incompatibleWith.map(x=>{CONFLICTCOURSE:x});
              const courseToAdd={COURSEID: courseId, CREDITS: props.course.cfu, NAME: props.course.name, PREPCOURSE: props.course.preparatoryCourse, conflictCourses:array};
              props.setEditCourses([...props.editCourses, courseToAdd]);
              setPopOverMessage('Successfully added!');
              }
        }
    }
    return (
      <>
        <tr className={props.formEdit? conflictColor? "table-danger": addedColor? "table-secondary" : "" :""}>
            <CourseData addCourse={addCourse} popOverMessage={popOverMessage} course={props.course} show={show} setShow={setShow} formEdit={props.formEdit} editCourses={props.editCourses} setEditCourses={props.setEditCourses}/>
        </tr>
        <tr></tr>
        <tr id={props.course.code} className={show? "infoVisible" : "infoHidden"}>
            <td colSpan={7} className="extraInfo">
            <h6><b>Conflict Courses</b></h6>
            <ListGroup as="ol" numbered>
                {
                  props.course.incompatibleWith.length>0 ? props.course.incompatibleWith.map((c, index) => <ListGroup.Item as="li" key={index}>{c}</ListGroup.Item>) : <p>No conflict course</p>
                }
            </ListGroup>
            <h6><b>Preparatory Course</b></h6>
            <ListGroup as="ol" numbered>
                {
                  props.course.preparatoryCourse ? <ListGroup.Item as="li" >{props.course.preparatoryCourse}</ListGroup.Item> : <p>No preparatory course</p>
                }
            </ListGroup>
            </td>
        </tr>
      </>
    );
}

function CourseData(props) {
    const popover = (
    <Popover id="popover-basic">
      <Popover.Body>
        {props.popOverMessage}
      </Popover.Body>
    </Popover>
    );
    return (
        <>
            <td>{props.course.code}</td>
            <td>
              {props.course.name}
            </td>
            <td>
              <button className="btn" type="button" onClick={(x) => props.setShow(!props.show)}>
                <i className="bi bi-info-circle"></i>
              </button>
            </td>
            <td>{props.course.cfu}</td>
            <td>{props.course.maxStudents ? props.course.maxStudents: ""}</td>
            <td>{props.course.enrolledStudents}</td>
            {props.formEdit &&
                <td>
                  <OverlayTrigger trigger="click" placement="right" overlay={popover} rootClose>
                    <button className="btn" type="button" onClick={(x)=>props.addCourse(props.course.code)}>
                      <i className="bi bi-plus-circle"></i>&emsp;&emsp;
                    </button>
                  </OverlayTrigger>
                </td>
            }
        </>
    );
}

export { Courses };
