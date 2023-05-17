import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Col, Container, Row, Alert} from 'react-bootstrap';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import API from './API';
import './App.css';
import { Courses } from './components/course/CourseComponents';
import { Plan } from './components/plan/PlanComponents'
import { NavigationBar } from './components/Navbar';
import { LoginForm } from './components/AuthComponents';
import Course from './components/course/Course';

function App() {
  const [courses, setCourses] = useState([]);
  const [plan, setPlan] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressPerc, setProgressPerc]=useState(false);
  const [formEdit, setFormEdit] = useState(false);
  const [editCourses, setEditCourses] = useState([]);
  const [deletePlan, setDeletePlan] = useState(false);
  const [newMin, setNewMin] = useState();
  const [newMax, setNewMax] = useState();
  const [message, setMessage] = useState('');


  const getCourses = async () => {

    const courses = await API.getAllCourses();
    courses.sort(function(a, b) {
        return compareStrings(a.name, b.name);
    })
    courses.map(c => new Course(c.code, c.name, c.cfu, c.enrolledStudents, c.maxStudents, c.incompatibleWith, c.preparatoryCourse));
    setCourses(courses);

  };

  const getPlan = async (userId) => {
    try{
        const planCheck = await API.getPlanByUserId(userId);
        setPlan(planCheck);
        if(planCheck){
          setEditCourses(planCheck.courses);
          setNewMax(planCheck.maxCredits);
          setNewMin(planCheck.minCredits);
        }
    }catch(err){
      setPlan(false);
      console.log(err);
    }
  };

  const progressBar=async()=>{
    try{
        if(editCourses){

          let selected=editCourses.reduce((a,b)=>a+b.CREDITS,0);
          let max=newMax;
          if(max!==null && selected!==null){
            let progress=`${selected}/${max}`
            let proPerc= (selected/max)*100;
            proPerc=Math.trunc(proPerc);
            setShowProgress(progress);
            setProgressPerc(proPerc);
          }else{
            setShowProgress("");
            setProgressPerc(0);
          }
        }else{
          setShowProgress("");
          setProgressPerc(0);
        }
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    progressBar();
  }, [editCourses, newMin, newMax]);

  const cancel=async()=>{
    try{
      setFormEdit(false);
      setEditCourses(plan.courses);
    }catch(err){
      console.log(err);
    }
  }

  const deletePlanByUserId=async()=>{
    try{
      const user = await API.getUserInfo();
      await API.deletePlan(user.id);
      setDeletePlan(!deletePlan);
      setProgressPerc(0);
      setEditCourses([]);
      setFormEdit(false);
      setPlan(false);
    }catch(err){
      console.log(err);
    }
  }

  const handleEditPlan=async(option)=>{
    try{
      const user = await API.getUserInfo();
      await API.modifyPlan(option, editCourses, user.id);
      setFormEdit(false);
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const user = await API.getUserInfo(); // we have the user info here
      if (user)
        setLoggedIn(true);
      return user;
    };

    checkAuth().then(user=>{
      getCourses();
      if(loggedIn){
          getPlan(user.id);
      }
    });
  }, [loggedIn, formEdit, deletePlan]);



  const handleLogin = async (credentials) => {
    try {
      await API.logIn(credentials);
      setLoggedIn(true);
      setMessage('');
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
      console.log(err);
    }
  };

  const handleCreatePlan=async(option)=>{
    try{
      const user=await API.getUserInfo();
      const plan=await API.storePlan(option, user.id);

      if(plan) getPlan(user.id);
    }catch(err){
      console.log(err);
    }
  }

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setProgressPerc(0);
    setShowProgress(false);
    setCourses([]);
    setMessage('');
    setFormEdit(false);
  };

  return (
    <Container fluid className="zeroPadding">
      <BrowserRouter>
      <NavigationBar loggedIn={loggedIn} handleLogout={handleLogout}/>
      {message && <Row className="alertRow">
        <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
      </Row>}
        <Routes>
          <Route path='/login' element={
            loggedIn ? <Navigate replace to='/homepage'/> : <LoginView login={handleLogin} />
          } />
          <Route path='/' element={
              loggedIn ? <Navigate replace to='/homepage'/> : <CourseView courses={courses}/>
          } />
          <Route path='/homepage' element={
              loggedIn ?
              <PlanView courses={courses}
                        plan={plan}
                        showProgress={showProgress}
                        progressPerc={progressPerc}
                        createPlan={handleCreatePlan}
                        setFormEdit={setFormEdit}
                        formEdit={formEdit}
                        editCourses={editCourses}
                        setEditCourses={setEditCourses}
                        editPlan={handleEditPlan}
                        cancel={cancel}
                        deletePlan={deletePlanByUserId}
                        newMin={newMin}
                        newMax={newMax}
                        setNewMin={setNewMin}
                        setNewMax={setNewMax}
                />

             : <LoginView login={handleLogin} />
          } />

          <Route path='*' element={<h1>Url makes no sense</h1>} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}

function compareStrings(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function CourseView(props) {
  return (
    <Container fluid>
      <Row>
        <Col>
          <Courses courses={props.courses}></Courses>
        </Col>
      </Row>
    </Container>
  );
}

function PlanView(props) {
  return (
    <Container fluid>
      <Row>
        <Col>
          <Courses courses={props.courses} formEdit={props.formEdit} editCourses={props.editCourses} setEditCourses={props.setEditCourses}/>
        </Col>
        <Col>
          <Plan plan={props.plan}
                showProgress={props.showProgress}
                createPlan={props.createPlan}
                setFormEdit={props.setFormEdit}
                formEdit={props.formEdit}
                editCourses={props.editCourses}
                setEditCourses={props.setEditCourses}
                editPlan={props.editPlan}
                cancel={props.cancel}
                deletePlan={props.deletePlan}
                newMin={props.newMin}
                newMax={props.newMax}
                setNewMin={props.setNewMin}
                setNewMax={props.setNewMax}
                progressPerc={props.progressPerc}

            />
       </Col>
      </Row>
    </Container>
  );
}

function LoginView(props) {
  return (
    <Container>
      <Row>
        <Col>
          <LoginForm login={props.login} />
        </Col>
      </Row>
    </Container>
  );
}

export { Course };
export default App;
