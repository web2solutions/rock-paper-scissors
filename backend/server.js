const  WebSocketServer = require("ws");
const port = 4001;
const  wss = new WebSocketServer.Server({  port });

console.log(`WsS app listening on port ${port}`);

let gameStore = {};
let connectedPlayers = 0;
let totalPlays = 0;

function canJoinGame(ws) {
    // can have up to 2 players;
    if(connectedPlayers >= 2) {
        ws.send(JSON.stringify({ command: 'error', message: 'Too many players' }));
        ws.close();
        return false;
    }
    return true;
}

function determineWinner() {
    let winner = undefined;
    Object.keys(gameStore).forEach(userId => {
        const selectedValue = gameStore[userId];
        if(!winner) {
            winner = {userId, selectedValue }
            return;
        }
        if(winner.selectedValue === 'Rock') {
            if(selectedValue === 'Rock') {
                winner = undefined;
            } else if(selectedValue === 'Paper') {
                winner = {userId, selectedValue }
            }
        } else if(winner.selectedValue === 'Paper') {
            if(selectedValue === 'Paper') {
                winner = undefined;
            } else if(selectedValue === 'Iscissors') {
                winner = {userId, selectedValue }
            }
        } else if(winner.selectedValue === 'Iscissors') {
            if(selectedValue === 'Iscissors') {
                winner = undefined;
            } else if(selectedValue === 'Rock') {
                winner = {userId, selectedValue }
            }
        } 
    });
    return winner;
}

function gameOver() {
    const winner = determineWinner();
    wss.broadcast(JSON.stringify({ winner, command: 'game-over' }));
    wss.disconnectAll();
    gameStore = {};
    connectedPlayer = 0;
    totalPlays = 0;
}

function processMessage(message, ws) {
    const { command, userId, selectedValue } = JSON.parse(message);
    if(command === 'join-game') {
        ws.id = userId;
        gameStore[userId] = '';
        connectedPlayers += 1;
        wss.broadcast(JSON.stringify({ command: 'info', message: `Player ${userId} joined` }));
    } else if(command === 'select-and-play') {
        gameStore[userId] = selectedValue;
        totalPlays += 1;
        if(totalPlays === connectedPlayers) {
            gameOver();
        }
    } 
}

function onMessageHandler(message, ws) {
    try {
        processMessage(message, ws);
    } catch (error) {
        console.log('wrong message format');
    }
}



wss.on('connection', ws => {
    if(!canJoinGame(ws)) return;
    ws.on('message', (message) => onMessageHandler(message, ws));
    ws.on('close', () => {
        delete gameStore[ws.id]
        connectedPlayers -= 1;
    });
});

wss.broadcast = function broadcast(msg) {
    wss.clients.forEach(client => client.send(msg));
};

wss.disconnectAll = function disconnectAll() {
    wss.clients.forEach(client => client.close());
};