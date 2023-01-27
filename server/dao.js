"use strict";

const sqlite = require('sqlite3');


// open the database
const db = new sqlite.Database('./db.sqlite', (err) => {
    if (err) throw err;
});

// open database for debug
// const db = new sqlite.Database('./server/db.sqlite', (err) => {
//     if (err) throw err;
// });


exports.getBonusWordsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT word FROM words WHERE category=? AND used=0';
        db.all(sql, [category], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const words = rows.map( (w) => (w.word) )
            resolve(words);
        });
    });
}

exports.getWordsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT word FROM words WHERE category=?';
        db.all(sql, [category], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const words = rows.map( (w) => (w.word) )
            resolve(words);
        });
    });
}

exports.getAllUserRounds = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM rounds WHERE username=?';
        db.all(sql, [username], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const rounds = rows.map(r => ({ roundId : r.roundId, username : r.username, score: r.score, category : r.category, letter : r.letter }));
            resolve(rounds);
        });
    });
}

exports.getWordsUsageByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT word, used FROM words WHERE category=?';
        db.all(sql, [category], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const usages= rows.map((r) => ({word : r.word, usage : r.used}));
            resolve(usages);
        });
    });
}

exports.updateWordUsage = (word,used) => {
    return new Promise( (resolve,reject) => {
        const sql = 'UPDATE words SET used=? WHERE word=?';
        db.run(sql,[used, word], (err) => {
            if(err){
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

exports.saveUserRound = (username, score, category, letter) => {
    return new Promise((resolve,reject) => {
        const sql = 'INSERT INTO rounds(username,score,category,letter) VALUES(?,?,?,?)';
        db.run( sql, [username,score,category,letter], (err)=> {
            if(err){
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

exports.getBestUserForCategory = (category) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT username, SUM(score) AS score FROM rounds WHERE category=? GROUP BY username';
        db.all(sql, [category], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const users = rows.map((r) => ({username : r.username, score : r.score}));
            resolve(users);
        });
    });
}