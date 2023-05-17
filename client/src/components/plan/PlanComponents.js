import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Table, Button, Form, Container, Popover, OverlayTrigger} from 'react-bootstrap';
import { useState, useEffect } from 'react';

function Plan(props) {
  const [form, setForm] = useState(false);
    return (
       <Col>
        <h5><b>MY STUDY PLAN</b></h5>
        {!props.plan && !form && <Container fluid className="createPlanContainer"><CreatePlan progressPerc={props.progressPerc} showProgress={props.showProgress} form={form} setForm={setForm}/> </Container>}
        {form && !props.plan &&
          <Container className="createPlanContainer">
            <Col>
              <p>&emsp;<b>INFO</b></p>
                <p>
                  &emsp;<b>Option:</b> Full-time
                  <br></br>
                  &emsp;&emsp;<span className="infoCredits">Minimum Credits:</span> 60
                  <br></br>
                  &emsp;&emsp;<span className="infoCredits">Maximum Credits:</span> 80
                </p>
                <p>
                  &emsp;<b>Option:</b> Part-time
                    <br></br>
                    &emsp;&emsp;<span className="infoCredits">Minimum Credits:</span> 20
                    <br></br>
                  &emsp;&emsp;<span className="infoCredits">Maximum Credits:</span> 40
                </p>
              </Col>

            <Col>
                <PlanFormCreate setForm={setForm} createPlan={props.createPlan}/>
            </Col>
          </Container>
          }
        {props.plan &&
          <Container fluid className="editPlanContainer">
          <Col>
            <Row className="editRow">
              <Col>
                <b>Study Plan</b> &emsp;
                <button className="btn" type="button" onClick={()=>props.deletePlan()}>
                  <i className="bi bi-trash3"></i>
                </button>
                </Col>
            </Row>
            <br></br>

            <Row>
              <EditPlan showProgress={props.showProgress}
                        plan={props.plan}
                        formEdit={props.formEdit}
                        editCourses={props.editCourses}
                        setEditCourses={props.setEditCourses}
                        editPlan={props.editPlan}
                        cancel={props.cancel}
                        newMin={props.newMin}
                        newMax={props.newMax}
                        setNewMin={props.setNewMin}
                        setNewMax={props.setNewMax}
                        progressPerc={props.progressPerc}

              />
            </Row>

           {!props.formEdit &&
             <Col className="buttonCol">
                <Button className="bn632-hover bn27" borderless="true" onClick={() => props.setFormEdit(true)}>EDIT</Button>
             </Col>}
          </Col>
          </Container>
        }
       </Col>
    );
}

function CreatePlan(props){
  return(
    <>
    <Col><span>No plan created yet. </span></Col>
    <Col className="buttonCol"><Button className="bn632-hover bn27" borderless="true" onClick={() => props.setForm(true)}>CREATE</Button></Col>
    </>
  );
}

function PlanFormCreate(props){
  const [option, setOption] = useState('full-time');

  const handleCreate = (event) => {
    event.preventDefault();
    props.createPlan(option);
    props.setForm(false);
  };
  return(
    <>
    <Form onSubmit={handleCreate}>
    <Form.Group className="mb-3 createForm" controlId='option'>
    <Form.Label>SELECT OPTION</Form.Label>
    <Form.Select  onChange={ev => setOption(ev.target.value)}>
    <option>full-time</option>
    <option>part-time</option>
    </Form.Select>
    </Form.Group>
    <Button type="submit" className="bn632-hover bn27" borderless="true">CONFIRM</Button>
    </Form>
    </>
  );
}

function EditPlan(props){
  const [optionEdit, setOptionEdit] = useState(props.plan.option);
  const [minCredits, setMinCredits] = useState();

  const [popOverMessage, setPopOverMessage]=useState('');

  const optionSelection = (option)=>{
    setOptionEdit(option);
    if(option==="full-time"){
      props.setNewMin(60);
      props.setNewMax(80);
    }else if(option==="part-time"){
      props.setNewMin(20);
      props.setNewMax(40);
    }
  }

  const handleCancel = () => {
      if(optionEdit!==props.plan.option){
        if(props.plan.option==="part-time"){
          props.setNewMin(20);
          props.setNewMax(40);
        }else{
          props.setNewMin(60);
          props.setNewMax(80);
        }
      }
      props.cancel();
  };


  useEffect(() => {
    if(minCredits){
      props.editPlan(optionEdit, props.editCourses);
      setMinCredits(false);
    }else{
      setPopOverMessage("Cannot save plan, number of credits threshold not reached!");
    }
    }, [minCredits]);

  const handleEdit = (event) => {
      event.preventDefault();

      let credits=0;
      for(let i=0; i<props.editCourses.length; i++){
        credits=credits+props.editCourses[i].CREDITS;
      }
      if(credits>=props.newMin && credits<=props.newMax){
        setMinCredits(true);
      }else{
        setMinCredits(false);
      }
  };

  const popover = (
  <Popover id="popover-basic">
    <Popover.Body>
      {popOverMessage}
    </Popover.Body>
  </Popover>
  );
  return(
    <>
      <Progress newMin={props.newMin} newMax={props.newMax} showProgress={props.showProgress}  progressPerc={props.progressPerc} editCourses={props.editCourses}/>
      <br></br>
      <Row className="editRow">
      &emsp;
      {!props.formEdit &&
        <span>
          <p><b>INFO</b></p>
          <b>Option:</b> {props.plan.option}
          <br></br>
          &emsp;<span className="infoCredits">Minimum Credits:</span> {props.plan.minCredits}
          <br></br>
          &emsp;<span className="infoCredits">Maximum Credits:</span> {props.plan.maxCredits}
          <br></br>
          <br></br>

          <Row className="editRow">
            <p><b>Courses List</b></p>
          {props.editCourses.length>0?
            <Table hover>
              <tbody>
              {props.editCourses.map((c, index)=>
              <PlanRow key={index} course={c} formEdit={props.formEdit}/>
              )}
              </tbody>
            </Table>
            : <span>&emsp;<i>No courses added yet.</i></span>}
          </Row>
        </span>

      }
      {props.formEdit &&
        <Form onSubmit={handleEdit}>
              <Form.Group className="mb-3 createForm" controlId='option'>
                  <Form.Label>SELECT OPTION</Form.Label>
                      {props.plan.option==="full-time"?
                      <Form.Select  onChange={ev => optionSelection(ev.target.value)}>
                        <option>full-time</option>
                        <option>part-time</option>
                      </Form.Select>
                      :
                      <Form.Select  onChange={ev => optionSelection(ev.target.value)}>
                        <option>part-time</option><option>full-time</option>}
                      </Form.Select>
                      }
                      <br></br>
                      <span className="infoCredits">Minimum Credits:</span> {props.newMin}
                      <br></br>
                      <span className="infoCredits">Maximum Credits:</span> {props.newMax}
              </Form.Group>
              <br></br>
              <Row className="editRow">
                <p><b>Courses List</b></p>
              <Table hover>
              <tbody>
              {props.editCourses.length>0? props.editCourses.map((c, index)=>
                <PlanRow editCourses={props.editCourses} key={index} course={c} formEdit={props.formEdit} setEditCourses={props.setEditCourses}  cancel={props.cancel}/>
              ) : <p>&emsp;<i>No courses added yet.</i></p>
              }
              </tbody>
              </Table>
              </Row>
              <Row>
              <Col className="editButtons">
              {!minCredits && <OverlayTrigger trigger="click" placement="right" overlay={popover} rootClose>
                <Button type="submit" className="bn632-hover bn27" borderless="true" onClick={()=>handleEdit}>SAVE</Button>
              </OverlayTrigger> }
              {minCredits && <Button type="submit" className="bn632-hover bn27" borderless="true" onClick={()=>handleEdit}>SAVE</Button>}

              </Col>
              <Col className="editButtons">
                <Button className="bn632-hover bn26" borderless="true"  onClick={handleCancel}>CANCEL</Button>
              </Col>
              </Row>
      </Form>
      }

      </Row>
    </>
  );
}

function PlanRow(props) {
    const [deletable, setDeletable]=useState('');

    const deleteCourse=async(courseId)=>{
      //check that it is not preparatory course of another added course
      let obj = props.editCourses.find(data=> data.PREPCOURSE === courseId);
      if(obj!==undefined){
        setDeletable(obj.COURSEID);
      }else{
        props.setEditCourses([...props.editCourses].filter(x=>x.COURSEID!==props.course.COURSEID))
        setDeletable('');
      }
    }

    return (
      <>
        <tr>
            <PlanData course={props.course} deleteCourse={deleteCourse} formEdit={props.formEdit} cancel={props.cancel}/>
        </tr>
        <tr></tr>
        <tr id={props.course.COURSEID} className={deletable ? "infoVisible" : "infoHidden"}>
          <td></td>
          <td className="extraInfo deleteInfo">[{props.course.COURSEID}] cannot be deleted because it is a preparatory course for [{deletable}]</td>
          <td></td>
          <td></td>
        </tr>
      </>
    );
}

function PlanData(props) {
    return (
        <>
            <td>{props.course.COURSEID}</td>
            <td>
              {props.course.NAME}
            </td>
            <td>
              {props.course.CREDITS}
            </td>
            {props.formEdit &&
              <td>
                  <button className="btn" type="button" onClick={()=>props.deleteCourse(props.course.COURSEID)}>
                  <i className="bi bi-x-circle"></i>
                  </button>
              </td>
            }
        </>
    );
}


function Progress(props){
  return (
		<div className="progress">
			{props.editCourses && <div className={props.newMin*100/props.newMax<=props.progressPerc && props.progressPerc<=100? "progress-done":"progress-danger"} style={{width:`${props.progressPerc}%`}} >
				{props.progressPerc>0? `${props.showProgress}`: ""}
			</div>
     }
      {props.progressPerc>0? "" : <p className="zeroProgress">0%</p>}
		</div>
	)
}

export { Plan };
