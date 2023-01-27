import { useNavigate } from 'react-router-dom'
import { Button, Card } from 'react-bootstrap';
import { useState } from 'react';

function WelcomeMenu(props) {
    const [showMenu, setShowMenu] = useState(false);

    const navigate = useNavigate();

    setTimeout(function () {
        setShowMenu(true);
    }, 500);

    return (
        showMenu ?
            <div className='homepage'>
                <div className='menu-buttons'>
                    <div className='center-button'>
                        <Button onClick={() => navigate('/halloffame')}>Hall of fame</Button>
                    </div>
                </div>
                <RoundCards />
            </div > : <div className='loading-text'>
                <h2> Loading... </h2>
            </div>
    );
}

function LoggedWelcomeMenu(props) {
    const [showMenu, setShowMenu] = useState(false);

    const navigate = useNavigate();

    setTimeout(function () {
        setShowMenu(true);
    }, 500);

    return (
        showMenu ?
            <div className='homepage'>
                <div className='menu-buttons'>
                    <div className='left'>
                        <Button onClick={() => navigate('/halloffame')}>Hall of fame</Button>
                    </div>

                    <div className='right'>
                        <Button onClick={ () => navigate(`/history/${props.user.name}`)}> View past rounds </Button>
                    </div>
                </div>
                <RoundCards />
            </div > :
            <div className='loading-text'>
                <h2> Loading... </h2>
            </div>
    );
}


function RoundCards() {

    const navigate = useNavigate();

    return (
        <div className='round-cards'>
            <div className='animals'>
                <Card className='text-center'>
                    <Card.Img variant="top" src="https://animalfactguide.com/wp-content/uploads/2022/02/african-penguin-725x425.jpg" className='img' />
                    <Card.Body>
                        <Card.Title>Animals</Card.Title>
                        <Button variant="primary" onClick={() => navigate('/playround/animals')}>Start new round</Button>
                    </Card.Body>
                </Card>
            </div>
            <div className='colors'>
                <Card className='text-center'>
                    <Card.Img variant="top" src="https://www.drupal.org/files/project-images/colours.jpg" className='img' />
                    <Card.Body>
                        <Card.Title>Colors</Card.Title>
                        <Button variant="primary" onClick={() => navigate('/playround/colors')}>Start new round</Button>
                    </Card.Body>
                </Card>
            </div>
            <div className='countries'>
                <Card className='text-center'>
                    <Card.Img variant="top" src="https://educationblog.oup.com/wp-content/uploads/2015/09/oup_58381-705x435.jpg" className='img' />
                    <Card.Body>
                        <Card.Title>Countries</Card.Title>
                        <Button variant="primary" onClick={() => navigate('/playround/countries')}>Start new round</Button>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}
export { WelcomeMenu, LoggedWelcomeMenu }