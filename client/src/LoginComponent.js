import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const validator = require('validator');

function LoginForm(props) {
  const [username, setUsername] = useState('mario.rossi@polito.it');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    let valid = true;
    if (username === '' || password === '') {
      valid = false;
      setErrorMessage('Error(s) in the form, some field is empty');
    }

    if (!validator.isEmail(username)) {
      valid = false;
      setErrorMessage('Error in the form, the username must be an email');
    }

    if (valid) {
      props.login(credentials);

    }
  };

  return (
    <Container className='login-form'>
      <Row>
        <Col>
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert> : ''}
            <Form.Group controlId='username'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <div className='form-buttons'>
              <div className='dologin-button'>
                <Button onClick={handleSubmit}> Login </Button>
              </div>
              <div className='back-button'>
                <Button variant='secondary' onClick={() => navigate('/')}>Back</Button>
              </div>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

function LogoutIcon(props) {
  return (
    <Col id="user-icon">
      {props.name}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16" onClick={props.logout}>
        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
      </svg>
    </Col>
  )
}

export { LoginForm, LogoutIcon };