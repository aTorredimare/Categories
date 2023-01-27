'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const cors = require('cors');

// init express
const app = new express();
const port = 3001;

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

/*** APIs ***/

/*  Data  */
//PUT /validateround
app.put('/api/validateround', isLoggedIn, [
  check('words.*').isString(),
  check('category').isString(),
  check('givenLetter').isAlpha(),
  check('difficulty').isInt({ min: 1, max: 4 }),
  check('username').isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const words = req.body.words;
  const category = req.body.category;
  const givenLetter = req.body.givenLetter;
  const difficulty = req.body.difficulty;
  const username = req.body.username;

  const uniqueWords = words
    .filter(w => w.charAt(0).toLocaleLowerCase() == givenLetter.toLocaleLowerCase()) //discard words with different initials
    .filter((w, ind) => { return words.indexOf(w) == ind; }) //discard duplicate words

  /**
   * Prima di inserire punteggio, controllare se il vincolo sul numero di parole in base alla difficoltà è stato rispettato
   * Se sì, procedere al calcolo del punteggio, se no ritornare una sola parola che contiene la stringa "Not enough words, round not saved" da mostrare all'utente
   */
  let minimumWordsNumber = 0;
  switch (difficulty) {
    case 1:
      minimumWordsNumber = 2;
      break;
    case 2:
      minimumWordsNumber = 3;
      break;
    case 3:
      minimumWordsNumber = 4;
      break;
    case 4:
      minimumWordsNumber = 6;
      break;
    default:
      break;
  }

  if (uniqueWords.length < minimumWordsNumber)
    return res.status(200).json({ error: "Not enough valid words, round not saved!" });


  let returnData = []; //sarà un vettore di oggetti
  /**
   * Ragionamento: uniqueWords contiene le parole inserite dall'utente senza duplicati, tutte che iniziano con la lettera corretta
   * Per verificare se una parola è da contare o no mi basta dunque verificare se questa appartiene alla lista di tutte le parole della
   * categoria corrente (basta prendere dal DB tutte le parole della categoria)
   */
  let wordList = [];
  try {
    wordList = await dao.getWordsByCategory(category);
  } catch (err) {
    res.status(503).json("Errore durante calcolo punteggio!");
  }

  /**
   * Punteggio: chiedo al db le parole della categoria attuale che NON sono state usate negli ultimi due round, se ho un match con la 
   * parola attuale assegno punteggio bonus, altrimenti assegno punteggio normale
   */
  let bonusWords = [];
  try {
    bonusWords = await dao.getBonusWordsByCategory(category);
  } catch (err) {
    res.status(503).json("Errore durante calcolo punteggio!");
  }

  let roundScore = 0;
  for (const w of uniqueWords) {
    const actual = { word: w, score: 0 }
    if (bonusWords.includes(w)) {
      actual.score = 10 * difficulty;
    } else if (wordList.includes(w)) {
      actual.score = 5 * difficulty;
    }
    returnData.push(actual);
    roundScore += actual.score;
  }

  //se non ho inserito nessuna parola valida, inutile salvare il round e andare avanti
  if (roundScore == 0)
    return res.status(200).json({ error: "Not enough valid words, round not saved!" });

  //MANCA L'AGGIORNAMENTO DELLE PAROLE USATE
  /**
   * 1. creo un vettore che contiene coppie del tipo {word,usage} (contiene il numero di utilizzi per ogni parola)
   * 2. scorro il vettore contenente le parole della categoria attuale, e pongo a 2 l'utilizzo di tutte le parole 
   * utilizzate in questo round, mentre decremento di uno l'utilizzo di tutte le parole 
   * che in questo round non sono state utilizzate (se usage==0 non faccio nulla)
   * 3. aggiorno il db con i nuovi valori appena calcolati
   */

  let wordsUsage = [];
  try {
    wordsUsage = await dao.getWordsUsageByCategory(category);
  } catch (err) {
    throw (err);
  }

  for (const w of wordList) {
    const ind = wordsUsage.findIndex(u => u.word == w);
    if (uniqueWords.includes(w)) {
      wordsUsage[ind].usage = wordsUsage[ind].usage = 2;
    }
    else {
      wordsUsage[ind].usage = wordsUsage[ind].usage == 0 ? 0 : wordsUsage[ind].usage - 1;
    }
  }

  for (const w of wordsUsage) {
    dao.updateWordUsage(w.word, w.usage)
      .then()
      .catch(() => res.status(503).json('Errore durante calcolo punteggio!'))
  }

  //salvataggio round
  try {
    await dao.saveUserRound(username, roundScore, category, givenLetter);
  } catch (err) {
    throw err;
  }

  //ritorna
  return res.status(200).json(returnData);

});

//GET /history/username
app.get('/api/history/:username', isLoggedIn, [
], async (req, res) => {
  dao.getAllUserRounds(req.params.username)
    .then(rounds => res.json(rounds))
    .catch(() => res.status(500).end())
});

// GET /bestin/:category
app.get('/api/bestin/:category', async (req, res) => {
  try {
    const bestUsers = await dao.getBestUserForCategory(req.params.category);
    res.json(bestUsers);
  } catch (err){
    res.status(500).end()
  }
});


/* User */
// POST /sessions (login)
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current (logout)
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current (check whether the user is logged in or not)
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});