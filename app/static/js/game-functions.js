var user = ""
var userIsReady = false
var userIsHost = false
var userColor = setUserColor()
var privateWord = ""
var encodedWord = ""
var allAttempts = 27
var newWord = [];

function setUserConfiguration(userName, userReady) {
    user = userName;
    userIsReady = userReady;
}

function setUserColor() {
    let possibleColors = ["blue", "red", "green", "black", "purple", "violet", "palevioletred", "maroon"]
    return possibleColors[Math.floor(Math.random() * possibleColors.length)];
}

function userReady(button) {
    if (userIsReady) {
        socket.emit('userUnReady', user)
        button.innerHTML = "READY"
        button.style.background = 'lightgreen';
        button.style.color = 'black';
        userIsReady = false;
        document.getElementById("readyStatus").innerHTML = "(You are NOT READY)";
        document.getElementById("readyStatus").style.color = 'red';
    } else {
        socket.emit('userReady', user)
        button.innerHTML = "UNREADY"
        button.style.background = 'red';
        button.style.color = 'white';
    }
}

function quitReadySymbolFromTable(userName) {
    var table = document.getElementById("usersConnected");

    for ( let [i,row] of [...table.rows].entries() ) {
        for( let [j,cell] of [...row.cells].entries() ) {
            console.log(`[${i}] = ${cell.innerText}`)

            if (cell.innerText === `✅ ${userName}`) {
                cell.innerHTML = userName;
            }
        }
    }
}

function onLobbyEnter() {
    document.getElementById("usersConnected").createTHead().insertRow(-1).insertCell(-1).innerHTML = "<strong>Users Connected</strong>";
    document.getElementById("usersConnected").insertRow(-1).insertCell(-1).innerHTML = user;
    
    socket.emit('AddUserName', user)
}

function showUserList(users) {
    for (let index = 0; index < users.length; index++) {
        if (users[index]['userName'] === user) {
            continue
        }

        document.getElementById("usersConnected").insertRow(-1).insertCell(-1).innerHTML = users[index]['userName'];
    }
}

function addUserToList(userToAdd) {
    document.getElementById("usersConnected").insertRow(-1).insertCell(-1).innerHTML = userToAdd;
}

function removeUserFromList(userToRemove) {
    var table = document.getElementById("usersConnected");
    var rowToDelete = 0;

    for ( let [i,row] of [...table.rows].entries() ) {
        for( let [j,cell] of [...row.cells].entries() ) {
            console.log(`[${i}] = ${cell.innerText}`)

            if (cell.innerText === userToRemove['userName'] || cell.innerText === `✅ ${userToRemove['userName']}`) {
                rowToDelete = i;
            }
        }
    }

    document.getElementById("usersConnected").deleteRow(rowToDelete);
}

function updateReadyCounter(params) {
    document.getElementById("readyCounter").innerHTML = params[0];

    var table = document.getElementById("usersConnected");
    for ( let [i,row] of [...table.rows].entries() ) {
        for( let [j,cell] of [...row.cells].entries() ) {
            console.log(`[${i}] = ${cell.innerText}`)

            for (let name of params[1]) {
                if (cell.innerText === name) {
                    cell.innerHTML = `✅ ${cell.innerText}`
                }
            }
        }
    }
    
}

function updateSelfStatus() {
    userIsReady = true;
    document.getElementById("readyStatus").innerHTML = "(You are READY)";
    document.getElementById("readyStatus").style.color = 'green';
    document.getElementById('startButton').style.display = 'block';
}

function sendStartGameRequest() {
    socket.emit('startGameRequest')
}

function sendMessage(userMessage, messageType) {
    if (userMessage === "") return;
    
    if (messageType === "Letter") {
        socket.emit('userAttempt', {'userMessage': userMessage[0], 'userName': user, 'userColor': userColor, 'isNotRated': false})
    } else if (messageType === "Word") {
        socket.emit('userAttempt', {'userMessage': userMessage, 'userName': user, 'userColor': userColor, 'isNotRated': false})
    } else if (messageType === "Chat") {

        if (userMessage[0] === "/") {
            socket.emit('userCommand', {'userCommand': userMessage, 'userName': user, 'userColor': userColor, 'isHost': userIsHost})
            return;
        }

        socket.emit('userAttempt', {'userMessage': userMessage, 'userName': user, 'userColor': userColor, 'isNotRated': true})
    }
}

function startGameProcess(userToChoose) {
    document.getElementById('lobbyPanel').style.display = 'none';
    document.getElementById('gamePanel').style.display = 'none';
    document.getElementById('waitingForWord').style.display = 'block';
    document.getElementById('currentTitle').innerHTML = 'Choosing a word to guess...';
    document.getElementById('userSelectingWord').innerHTML = `-> ${userToChoose} is currently choosing a word to guess!`;
}

function startGameError() {
    document.getElementById('startError').innerHTML = "All players must be ready and there must be at least 2 or more users connected!"
}

function chooseWord(userToChoose) {
    // Verify user
    if (userToChoose['userName'] == user) {
        userIsHost = true;
        document.getElementById('waitingForWord').style.display = 'none';
        document.getElementById('userChooseControl').style.display = 'block';
    }
}

function checkWord(wordToGuess) {
    if (wordToGuess === "") {
        document.getElementById('wordError').innerHTML = "ERROR: The word that is going to be guessed cannot be empty!"
        return;
    }
    if (wordToGuess.split(" ").length >= 2) {
        document.getElementById('wordError').innerHTML = "ERROR: Don't use white space between words!"
        return;
    }
    if (!/^[a-zA-Z]+$/.test(wordToGuess)) {
        document.getElementById('wordError').innerHTML = "ERROR: Use only letters!"
        return;
    }
    if (wordToGuess.length <= 3) {
        document.getElementById('wordError').innerHTML = "ERROR: Word must be longer than 3 letters!"
        return;
    }

    document.getElementById('userChooseControl').style.display = 'none';
    document.getElementById('privateWord').innerHTML = `(Your word: ${wordToGuess})`;

    if (userIsHost) {
        document.getElementById('MessageType').value = "Chat"
    }

    socket.emit('startGameOficially', wordToGuess)
}

function loadGame(wordToGuess) {
    document.getElementById('gamePanel').style.display = 'block';
    document.getElementById('chatContainer').style.display = 'block';
    document.getElementById('lobbyPanel').style.display = 'none';
    document.getElementById('waitingForWord').style.display = 'none';
    document.getElementById('currentTitle').innerHTML = 'Game';
    document.getElementById('codedWord').innerHTML = wordToGuess[1];

    document.getElementById("readyStatus").innerHTML = "(You are NOT READY)";
    document.getElementById("readyStatus").style.color = 'red';
    document.getElementById("readyButton").style.background = 'lightgreen';
    document.getElementById("readyButton").innerHTML = 'READY';
    document.getElementById("readyButton").style.color = 'black';
    
    if (!userIsHost) {
        document.getElementById('thisUserAttempts').innerHTML = `Attempts Left: ${allAttempts}`;
    }

    privateWord = wordToGuess[0]
    encodedWord = wordToGuess[1]
}

function showUserAttempt(userAttempt) {
    let wordIsComplete = true;
    var chatScroll = document.getElementById('chatMessages');
    let currentChat = document.getElementById('chatMessages').innerHTML;
    document.getElementById('chatMessages').innerHTML = currentChat + `<br>- <strong style="color: ${userAttempt['userColor']}">${userAttempt['userName']}</strong>: ${userAttempt['userMessage']}`;
    chatScroll.scrollTop = chatScroll.scrollHeight;

    if (userAttempt['isNotRated']) return;

    if (userAttempt['userMessage'].length === 1) {
        var matches = []
        privateWord.split("").forEach((value, index) => {
            console.log(`${index} -> ${value}`)
            if (value === userAttempt['userMessage']) {
                matches.push(index)
            }
        })

        if (matches.length === 0) {
            socket.emit('userAttemptFail', {'userName': userAttempt['userName'], 'userColor': userAttempt['userColor']})
            return;
        } else {
            for (let [index, keyvalue] of matches.entries()) {
                encodedWord.split("").forEach((value, position) => {
                    if (value === "_" && position === keyvalue * 2) {
                        document.getElementById('chatMessages').innerHTML += `<br><strong><span style="color: green;">★ <span style="color: ${userAttempt['userColor']}">${userAttempt['userName']}</span> has guessed letter ${userAttempt['userMessage']}!</span></strong>`;
                        chatScroll.scrollTop = chatScroll.scrollHeight;
                        newWord.push(userAttempt['userMessage'])
                    } else {
                        newWord.push(value)
                    }
                });
                encodedWord = newWord.join("");

                if (index !== matches.length - 1) {
                    newWord = []
                }
            }

            newWord.forEach((value) => {
                if (value === "_") {
                    wordIsComplete = false;
                }
            });

            if (wordIsComplete) {
                document.getElementById('chatMessages').innerHTML = currentChat + `<br><strong><span style="color: green;">★ <span style="color: ${userAttempt['userColor']}">${userAttempt['userName']}</span> has guessed the word! ( ${privateWord} )</span></strong>`
                document.getElementById('chatMessages').innerHTML += "<br>"
                document.getElementById('chatMessages').innerHTML += "<br><strong style='color: red'>⚠ Going back to lobby in 10 seconds... </strong>"
                chatScroll.scrollTop = chatScroll.scrollHeight;
                setTimeout(() => {
                    socket.emit('gameFinished')
                }, 7000)            
            }
        }
    } else {
        if (userAttempt['userMessage'] === privateWord) {
            document.getElementById('codedWord').innerHTML = userAttempt['userMessage'].split('').join(' ');
            document.getElementById('chatMessages').innerHTML += `<br><strong><span style="color: green;">★ <span style="color: ${userAttempt['userColor']}">${userAttempt['userName']}</span> has guessed the word! ( ${privateWord} )</span></strong>`
            document.getElementById('chatMessages').innerHTML += "<br>"
            document.getElementById('chatMessages').innerHTML += "<br><strong style='color: red'>⚠ Going back to lobby in 10 seconds... </strong>"
            chatScroll.scrollTop = chatScroll.scrollHeight;
            setTimeout(() => {
                socket.emit('gameFinished')
            }, 7000)
        } else {
            socket.emit('userAttemptFail', {'userName': userAttempt['userName'], 'userColor': userAttempt['userColor']})
        }
    }

    if (newWord.length !== 0) {
        encodedWord = newWord.join("");
        document.getElementById('codedWord').innerHTML = encodedWord;
        newWord = [];
    }
    chatScroll.scrollTop = chatScroll.scrollHeight;
}

function removeAttempt(userWhoFail) {
    if (userWhoFail['userName'] === user) {
        allAttempts -= 1;
        document.getElementById('thisUserAttempts').innerHTML = `Attempts Left: ${allAttempts}`;
        checkUserAttempts(allAttempts, userWhoFail);
    }
}

function checkUserAttempts(userAttempts, currentUser) {
    let hangmanDraw = document.getElementById('hangmanImage')

    if (userAttempts >= 25 && userAttempts < 27) {
        hangmanDraw.src = "/templates/img/hangmanComplete8.png";
    } else if (userAttempts >= 22 && userAttempts < 25) {
        hangmanDraw.src = "/templates/img/hangmanComplete7.png";
    } else if (userAttempts >= 19 && userAttempts < 22) {
        hangmanDraw.src = "/templates/img/hangmanComplete6.png";
    } else if (userAttempts >= 16 && userAttempts < 19) {
        hangmanDraw.src = "/templates/img/hangmanComplete5.png";
    } else if (userAttempts >= 13 && userAttempts < 16) {
        hangmanDraw.src = "/templates/img/hangmanComplete4.png";
    } else if (userAttempts >= 10 && userAttempts < 13) {
        hangmanDraw.src = "/templates/img/hangmanComplete3.png";
    } else if (userAttempts >= 7 && userAttempts < 10) {
        hangmanDraw.src = "/templates/img/hangmanComplete2.png";
    } else if (userAttempts >= 4 && userAttempts < 7) {
        hangmanDraw.src = "/templates/img/hangmanComplete1.png";
    } else if (userAttempts >= 1 && userAttempts < 4) {
        hangmanDraw.src = "/templates/img/hangmanComplete1.png";
    } else if (userAttempts <= 0) {
        socket.emit('userLost', currentUser)
        hangmanDraw.src = "/templates/img/hangmanComplete.png";
    }

}

function userLostResponse(userWhoLost) {
    var chatScroll = document.getElementById('chatMessages');
    if (userWhoLost['userName'] === user) {
        document.getElementById('userMessage').disabled = true;
    }
    document.getElementById('chatMessages').innerHTML += `<br><strong style='color: red'>⚠ <span style="color: ${userWhoLost['userColor']}">${userWhoLost['userName']}</span> couldn't guess the word! (This user is not able to send messages until the game is over)</strong>`
    chatScroll.scrollTop = chatScroll.scrollHeight;
}

function noOneGuessedTheWord(word) {
    var chatScroll = document.getElementById('chatMessages');
    document.getElementById('chatMessages').innerHTML += `<br><strong style='color: red'>⚠ Game is over! :(</strong>`
    document.getElementById('chatMessages').innerHTML += `<br><strong style='color: green'>The word was: ${word}</strong>`
    document.getElementById('chatMessages').innerHTML += `<br><strong style='color: green'>Better luck next time!</strong>`
    document.getElementById('chatMessages').innerHTML += "<br>"
    document.getElementById('chatMessages').innerHTML += "<br><strong style='color: red'>⚠ Going back to lobby in 15 seconds... </strong>"
    setTimeout(() => {
        socket.emit('gameFinished')
    }, 15000)
    chatScroll.scrollTop = chatScroll.scrollHeight;
}

function resetGame() {
    document.getElementById('chatMessages').innerHTML = "<center><strong>Chat</strong></center>";
    document.getElementById('chatContainer').style.display = 'none';
    document.getElementById('gamePanel').style.display = 'none';
    document.getElementById('waitingForWord').style.display = 'none';
    document.getElementById('userChooseControl').style.display = 'none';
    document.getElementById('readyStatus').style.color = 'red';
    document.getElementById('readyStatus').innerHTML = " (You are NOT READY) ";
    document.getElementById("readyButton").style.background = 'lightgreen';
    document.getElementById("readyButton").innerHTML = 'READY';
    document.getElementById("readyButton").style.color = 'black';
    document.getElementById('startError').innerHTML = "";
    document.getElementById('privateWord').innerHTML = "";
    document.getElementById('thisUserAttempts').innerHTML = "";
    document.getElementById('currentTitle').innerHTML = "Lobby";
    document.getElementById('wordToGuess').value = "";
    document.getElementById('userMessage').value = "";
    document.getElementById('MessageType').value = "Letter";
    document.getElementById('userMessage').disabled = false;
    document.getElementById('hangmanImage').src = "/templates/img/hangmanStart.png"

    userIsHost = false;
    userIsReady = false;
    newWord = []
    allAttempts = 27;
    userColor = setUserColor()

    var table = document.getElementById("usersConnected");

    for ( let [i,row] of [...table.rows].entries() ) {
        for( let [j,cell] of [...row.cells].entries() ) {
            console.log(`[${i}] = ${cell.innerText}`)
            if (String(cell.innerText).includes("✅")) {
                cell.innerHTML = String(cell.innerHTML).substring(2)
            }
        }
    }

    document.getElementById('lobbyPanel').style.display = 'block';
}

function getCommand(userInformation) {
    switch(userInformation['userCommand']) {
        case "/resetgame":
            document.getElementById('chatMessages').innerHTML += `<br><strong style='color: red'>⚠ <span style="color: ${userInformation['userColor']}">${userInformation['userName']}</span> has used ${userInformation['userCommand']} command. (Going back to lobby in 10 seconds) </strong>`
            document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
            setTimeout(() => {
                socket.emit('gameFinished')
            }, 7000)
            break;
        default:
            console.log("That's not a command.")
            break;
    }
}

function notEnoughAuthority() {
    document.getElementById('chatMessages').innerHTML += `<br><strong style="color: red">⚠ You have to be the host in order to use commands.</strong>`
    document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

var inputMessage = document.getElementById("userMessage");       
inputMessage.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendMessage(inputMessage.value, document.getElementById('MessageType').value);
        document.getElementById('userMessage').value = "";
    }
});

var chatOptions = document.getElementById("MessageType");
chatOptions.onchange = (event) => {
    var inputText = event.target.value;

    if (allAttempts <= 0) {
        document.getElementById('userMessage').disabled = true;
        return;
    }

    if (inputText === "Letter" && userIsHost || inputText === "Word" && userIsHost) {
        document.getElementById('userMessage').disabled = true;
    } else {
        document.getElementById('userMessage').disabled = false;
    }
}