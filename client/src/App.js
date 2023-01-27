import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Navbar } from './Navbar'
import { LoginForm } from './LoginComponent';
import API from './API';
import { LoggedWelcomeMenu, WelcomeMenu } from './WelcomeMenu';
import { Round } from './RoundComponent';
import './App.css';
import { RoundHistory } from './RoundHistoryComponent';
import { HallOfFame } from './HallOfFame';

function App() {
  return (
    <Router>
      <App2 />
    </Router>
  )
}

function App2() {
  // const [dirty,setDirty] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function errorHandler(error) {
    setMessage(error);
  }

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        navigate('/');
        //setDirty(true);
      })
      .catch(err => {
        setMessage(err);
      });
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    navigate('/');
    //setDirty(true);
  }

  return (
    <div className="App">
      <Navbar user={user} loggedIn={loggedIn} login={doLogIn} logout={doLogOut} ></Navbar>
      <Container>
        <Row className='message'><Col>
          {message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
        </Col></Row>
      </Container>

      <Routes>
        <Route path='/' element={ loggedIn ? <LoggedWelcomeMenu user={user} loggedIn={loggedIn} /> : <WelcomeMenu user={user} loggedIn={loggedIn} />} />
        <Route path='/login' element={ loggedIn ? <Navigate to='/' /> : <LoginForm login={doLogIn} user={user} errorHandler={errorHandler} />} />
        <Route path='/playround/:category' element={<Round loggedIn={loggedIn} user={user} errorHandler={errorHandler} />} />
        <Route path='/history/:username' element={loggedIn ? <RoundHistory user={user} errorHandler={errorHandler}/> : <Navigate to='/' />}/>
        <Route path='/halloffame' element={<HallOfFame errorHandler={errorHandler}/> }/>
        </Routes>
    </div>
  );
}

export default App;
