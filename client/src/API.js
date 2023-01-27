import { Prev } from "react-bootstrap/esm/PageItem";

const path = 'http://localhost:3001/api';
//const dayjs = require('dayjs');


/*** DATA ***/
async function validateRound(words, category, givenLetter, difficulty, username) {
    /**
     * Step da seguire:
     * 1. Mandare al server la lista delle parole inserite, la categoria e la lettera del round
     * 2. (SERVERSIDE) il server controllerà le parole (validation), calcolerà il punteggio e aggiornerà il campo used di ogni parola valida usata
     *    (ATTENZIONE: eliminare PAROLE DUPLICATE)
     * 3. Prendo la lista dei risultati generata del server e la restituisco al client
     */
    const response = await fetch(path + `/validateround/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ words : words, category : category, givenLetter: givenLetter, difficulty : difficulty, username : username}),
    });
    const responseWords = await response.json();

    if(response.ok){
        if(responseWords.error){
            return [{word : responseWords.error, score : -1}];
        }
        return responseWords
            .map( w => ({word : w.word, score : w.score}));
    } else {
        throw responseWords;
    }
}

async function getUserPastRounds(username){
    const response = await fetch(path + `/history/${username}`, {
        method: 'GET',
        credentials: 'include',
    });
    const responseRounds = await response.json();

    if(response.ok){
        return responseRounds.
            map( r => ( {roundId : r.roundId, username : r.username, score: r.score, category : r.category, letter : r.letter} ));
    } else{
        throw responseRounds;
    }
}

async function getBestForCategory(category){
    const response = await fetch(path + `/bestin/${category}`, {
        method: 'GET',
    });
    const responseUserInfo = await response.json();

    if(response.ok){
        return responseUserInfo.reduce( (prev,cur) => {
            return ( (prev.score > cur.score) ? prev : cur);
        } );
    } else {
        throw (responseUserInfo);
    }
}


/*** USER  ***/
async function logIn(credentials) {
    let response = await fetch(path + '/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function logOut() {
    await fetch(path + '/sessions/current', { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
    const response = await fetch(path + '/sessions/current', { credentials: 'include' });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}


const API = { validateRound, getUserPastRounds, getBestForCategory, logIn, logOut, getUserInfo };
export default API;