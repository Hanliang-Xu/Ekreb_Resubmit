const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000; // You may need to change PORT if 3000 is already in use

// Middleware to allow cross-origin requests
app.use(cors());

// Initialize game state variables
let score = 0;
let attempts = 0;
let wordLength = 7;
let currentWord = '';
let scrambledWord = '';
let nextWord = true;

/**
 * Scrambles a given string.
 * @param {string} str - The string to scramble.
 * @return {string} - The scrambled string.
 */
function scrambleString(str) {
    let arr = str.split('');
    for (let i = arr.length - 1; i > 0; --i) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

// Endpoint to get the current score
app.get('/score', (req, res) => {
    res.send(`${score}`);
});

// Endpoint to update the score
app.patch('/score', (req, res) => {
    score += parseInt(req.query.val);
    res.status(200).send(`${score}`);
});

// Endpoint to get the current attempts
app.get('/attempt', (req, res) => {
    res.send(`${attempts}`);
});

// Endpoint to update the attempts
app.patch('/attempt', (req, res) => {
    attempts += 1;
    res.status(200).send(`${attempts}`);
});

// Endpoint to set the desired word length
app.patch('/setWordLength', (req, res) => {
    wordLength = parseInt(req.query.val);
    res.sendStatus(200);
});

// Endpoint to get a scrambled word
app.get('/getWord', async (req, res) => {
    if (nextWord) {
        try {
            const rand = Math.floor(Math.random() * (wordLength - 1) + 2);
            const response = await axios.get(`https://random-word-api.herokuapp.com/word?length=${rand}`);
            currentWord = response.data[0];
            scrambledWord = scrambleString(currentWord);
            res.send(scrambledWord);
            nextWord = false;
        } catch (error) {
            console.error("Error fetching a new word:", error);
            res.status(500).send('Failed to fetch a new word');
        }
    } else {
        res.send(scrambledWord);
    }
});

// Endpoint to check if the guessed word is correct
app.patch('/guessWord', (req, res) => {
    if(req.query.word === currentWord) {
        score += 1;
        res.status(200).send('true');
        nextWord = true;
    } else {
        res.status(200).send('false');
    }
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});

// Endpoint to reset the score
app.get('/resetScore', (req, res) => {
    score = 0;
    res.send('Score reset');
});

// Endpoint to reset the attempts
app.get('/resetAttempt', (req, res) => {
    attempts = 0;
    res.send('Attempt reset');
});

// Endpoint to start a new game session
app.get('/startNewSession', (req, res) => {
    nextWord = true;
    res.status(200).send('New session started');
});