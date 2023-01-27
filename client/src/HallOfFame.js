import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from './API';

function HallOfFame(props) {
    const [bestForAnimals, setBestForAnimals] = useState([]);
    const [bestForColors, setBestForColors] = useState({});
    const [bestForCountries, setBestForCountries] = useState({});


    useEffect(() => {
        API.getBestForCategory('animals')
            .then(best => setBestForAnimals(best))
            .catch(err => props.errorHandler(err));
        API.getBestForCategory('colors')
            .then(best => setBestForColors(best))
            .catch(err => props.errorHandler(err));
        API.getBestForCategory('countries')
            .then(best => setBestForCountries(best))
            .catch(err => props.errorHandler(err));
    }, []);


    const navigate = useNavigate();

    return (
        <Container className='hall-of-fame'>
            <div className='center'>
                <h2 >HALL OF FAME</h2>
            </div>
            <div className='list-hof-items'>
                <div className="hof-item">
                    <h2>Animals</h2>
                    <h3>{`${bestForAnimals.username} : ${bestForAnimals.score}`}</h3>
                </div>
                <div className='hof-item'>
                    <h2>Colors</h2>
                    <h3>{`${bestForColors.username} : ${bestForColors.score}`}</h3>
                </div>
                <div className='hof-item'>
                    <h2>Countries</h2>
                    <h3>{`${bestForCountries.username} : ${bestForCountries.score}`}</h3>
                </div>
            </div>
            <div className='center-button'>
                <Button className="back" variant='secondary' onClick={() => { navigate('/'); }}>Back</Button>
            </div>
        </Container>
    );
}

export { HallOfFame }

