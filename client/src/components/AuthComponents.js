import { useState } from 'react';
import {Form, Button} from 'react-bootstrap';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (event) => {
      event.preventDefault();
      const credentials = { username, password };
      props.login(credentials);
  };

  return (
    <div className="Auth-form-container">
      <Form onSubmit={handleSubmit} className="Auth-form">
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>
          <div className="form-group mt-3">
            <Form.Group controlId='username'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} required={true} />
            </Form.Group>
          </div>
          <div className="form-group mt-3">
            <Form.Group controlId='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} required={true} minLength={6}/>
            </Form.Group>
          </div>
          <div className="d-grid gap-2 mt-3">
          <Button type="submit" className="myLogin" borderless="true">Login</Button>
          </div>
        </div>
    </Form>
  </div>
  )
};

function LogoutButton(props) {
  return(
        <Button type="submit" className="myLogout" borderless="true" onClick={props.logout}>LOGOUT</Button>
  )
}

export { LoginForm, LogoutButton };
