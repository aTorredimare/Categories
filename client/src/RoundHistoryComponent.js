import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Container } from 'react-bootstrap';
import API from './API';


function RoundHistory(props) {
    const [userRounds, setUserRounds] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        API.getUserPastRounds(props.user.name)
            .then(rounds => setUserRounds(rounds))
            .catch(err => props.errorHandler(err));
    }, []);

    return (
        <Container className='history-container' >
            <div className='title'>
                <h2>Your round history:</h2>
            </div>
            <Table striped bordered hover className='history-table'>
                <thead>
                    <tr>
                        <th>#roundId</th>
                        {/* <th>User Name</th> */}
                        <th>Score</th>
                        <th>Category</th>
                        <th>Given Letter</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        userRounds.map((round, index) => <RoundRow round={round} key={index} />)
                    }
                </tbody>
            </Table>
            <div className='center-button'>
                <Button className="back" variant='secondary' onClick={() => { props.errorHandler(''); navigate('/'); }}>Back</Button>
            </div>
        </Container>
    );
}

function RoundRow(props) {
    return (
        <tr>
            <td>{props.round.roundId}</td>
            {/* <td>{props.round.username}</td> */}
            <td>{props.round.score}</td>
            <td>{props.round.category}</td>
            <td>{props.round.letter}</td>
        </tr>
    );
}


export { RoundHistory }