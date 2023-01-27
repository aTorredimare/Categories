import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form, Table } from 'react-bootstrap';
import API from './API';

function Round(props) {
    const [guess, setGuess] = useState('');
    const [words, setWords] = useState([]);
    const [wordsAfterCorrection, setWordsAfterCorrection] = useState([]);
    const [givenLetter, setGivenLetter] = useState('');

    const [difficulty, setDifficulty] = useState(-1);
    const [showChoosing, setShowChoosing] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showProvTable, setShowProvTable] = useState(true);
    const [showDefTable, setShowDefTable] = useState(false);


    const { category } = useParams(1);

    const navigate = useNavigate();

    useEffect(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letter = chars.charAt(Math.floor(Math.random() * 26));
        setGivenLetter(letter);
    }, []);


    const handleSubmit = (event) => {
        event.preventDefault();

        if (guess.trim() === '') {
            props.errorHandler("Not permitted: blank answers will not be submitted!");
        }
        else if (guess.charAt(0).toLocaleLowerCase() != givenLetter.toLocaleLowerCase()) {
            props.errorHandler('Not permitted: wrong first letter!');
        }
        else {
            //clear form and add word
            props.errorHandler('');
            setWords([...words, guess]);
            event.target.reset();
            setGuess('');
        }
    }

    const finishRound = () => {
        //call API for score and storing word (if logged in, else DON'T!!!)
        if (props.loggedIn) {
            API.validateRound(words, category, givenLetter, difficulty, props.user.name)
                .then( wordsReturned => setWordsAfterCorrection(wordsReturned))
                .catch(err => props.errorHandler(err));
        }
        //change view
        setTimeout(() => {
            setShowForm(false);
            if (props.loggedIn) {
                setShowProvTable(false);
                setShowDefTable(true);
            }
        }, 500);
    }

    return (
        <Container className='round-container'>
            {showChoosing ?
                <div>
                    <div className='title'>
                        <h2>Choose difficulty:</h2>
                    </div>
                    <div className='difficulty-buttons'>
                        <div className="diff">
                            <Button variant='primary' onClick={() => { setDifficulty(1); setShowChoosing(false); setShowForm(true) }}>1</Button>
                        </div>
                        <div className="diff">
                            <Button variant='primary' onClick={() => { setDifficulty(2); setShowChoosing(false); setShowForm(true) }}>2</Button>
                        </div>
                        <div className="diff">
                            <Button variant='primary' onClick={() => { setDifficulty(3); setShowChoosing(false); setShowForm(true) }}>3</Button>
                        </div>
                        <div className="diff">
                            <Button variant='primary' onClick={() => { setDifficulty(4); setShowChoosing(false); setShowForm(true) }}>4</Button>
                        </div>
                    </div>
                </div>
                : false
            }

            {showForm ?
                <div className='guess-form'>
                    <div className='title'>
                        <PageTitle difficulty={difficulty} givenLetter={givenLetter} category={category} />
                    </div>
                    <div className='timer'>
                        <Timer finishRound={finishRound} />
                    </div>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Control type='text' name='guess' placeholder='Insert your answer here...' onChange={ev => setGuess(ev.target.value)} />
                            <Form.Text id="guess-help" muted>
                                Press ENTER to submit your guess, or click on the button below to finish the round earlier (WARNING: answers are case sensitive!)
                            </Form.Text>
                        </Form.Group>
                    </Form>

                    <div className='center-button'>
                        <Button className="formButton" variant='primary' onClick={finishRound}>Finish round</Button>
                    </div>
                </div>
                : false
            }
            {
                showProvTable && words.length > 0 ?
                    <ProvGuessesTable words={words} />
                    : false
            }

            {
                showDefTable && words.length > 0 ?
                    <div>
                        <h2>Round results:</h2>
                        <DefGuessesTable wordsAfterCorrection={wordsAfterCorrection} />
                    </div>
                    : false
            }

            <div className='center-button'>
                <Button className="back" variant='secondary' onClick={() => { props.errorHandler(''); navigate('/'); }}>Back</Button>
            </div>

        </Container>
    );
}

function ProvGuessesTable(props) {
    return (
        <Table striped bordered hover className='guesses-table'>
            <thead>
                <tr>
                    <th>Given guesses</th>
                </tr>
            </thead>
            <tbody>
                {
                    props.words.map((word, index) => <ProvTableRow word={word} key={index} />)
                }
            </tbody>
        </Table>
    );
}

function ProvTableRow(props) {
    return (
        <tr>
            <td> {props.word} </td>
        </tr>
    );
}

function DefGuessesTable(props) {
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let totalScore = 0;
        if(props.wordsAfterCorrection[0].score != -1){
            props.wordsAfterCorrection.forEach(
                (w) => {
                    totalScore += w.score;
                }
            );
            setTotal(totalScore);
        }
    }, []);

    if (props.wordsAfterCorrection[0].score != -1) {
        return (
            <Table striped bordered hover className='guesses-table'>
                <thead>
                    <tr>
                        <th>Given guesses</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.wordsAfterCorrection.map((w, i) => <DefTableRow word={w.word} score={w.score} key={i} />)
                    }
                    <tr>
                        <td> Total:</td>
                        <td> {total}</td>
                    </tr>
                </tbody>
            </Table>
        );
    } else {
        return (
            <div className='title'>
                <h2>{props.wordsAfterCorrection[0].word || 'prova'}</h2>
            </div>
        );
    }
}

function DefTableRow(props) {
    return (
        <tr className={props.score > 0 ? 'correct' : 'wrong'}>
            <td> {props.word} </td>
            <td> {props.score} </td>
        </tr>
    );
}


function PageTitle(props) {
    let stringTitle = '';
    let stringSubTitle = '';

    switch (props.difficulty) {
        case 1:
            stringTitle = `Chosen difficulty: ${props.difficulty}`;
            stringSubTitle = `Insert at least 2 words belonging to the following category: ${props.category}`;
            break;
        case 2:
            stringTitle = `Chosen difficulty: ${props.difficulty}`;
            stringSubTitle = `Insert at least 3 words belonging to the following category: ${props.category}`;
            break;
        case 3:
            stringTitle = `Chosen difficulty: ${props.difficulty}`;
            stringSubTitle = `Insert at least 4 words belonging to the following category: ${props.category}`;
            break;
        case 4:
            stringTitle = `Chosen difficulty: ${props.difficulty}`;
            stringSubTitle = `Insert at least 6 words belonging to the following category: ${props.category}`;
            break;
        default:
            break;
    }

    return (
        <div>
            <h2>{stringTitle}</h2>
            <h4>{stringSubTitle}</h4>
            <h2>{`Given letter: ${props.givenLetter}`}</h2>
        </div>
    );
}

function Timer(props) {
    const [remainingTime, setRemainingTime] = useState(60);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRemainingTime(timer => timer - 1);
        }, 1000);

        if (remainingTime == 0) {
            //mostra il caricamento, chiama API per calcolare punteggio, nascondi tabella provvisoria e mostra tabella definitiva
            props.finishRound();
            clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    }, [remainingTime]);

    return (
        <div className='timer'>
            <h4 className='question'>{`Time left : ${remainingTime} s`}</h4>
        </div>
    );
}
export { Round }