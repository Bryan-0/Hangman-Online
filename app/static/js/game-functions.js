var user = ""
var userIsReady = false
var userIsHost = false
var privateWord = ""
var encodedWord = ""
var allAttempts = 20
var newWord = [];

function setUserConfiguration(userName, userReady) {
    user = userName;
    userIsReady = userReady;
}

function userReady() {
    if (userIsReady) {
        console.log("User is ready.")
    } else {
        socket.emit('userReady', user)
    }
}

function onLobbyEnter() {
    document.getElementById("usersConnected").createTHead().insertRow(-1).insertCell(-1).innerHTML = "<strong>Users Connected</strong>";
    document.getElementById("usersConnected").insertRow(-1).insertCell(-1).innerHTML = user;
    
    socket.emit('AddUserName', user)
}

function showUserList(users) {
    for (let index = 0; index < users.length; index++) {
        if (users[index][0] === user) {
            continue
        }

        document.getElementById("usersConnected").insertRow(-1).insertCell(-1).innerHTML = users[index][0];
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

            if (cell.innerText === userToRemove[0] || cell.innerText === `✅ ${userToRemove[0]}`) {
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
        socket.emit('userAttempt', [userMessage[0], user, false])
    } else if (messageType === "Word") {
        socket.emit('userAttempt', [userMessage, user, false])
    } else if (messageType === "Chat") {
        socket.emit('userAttempt', [userMessage, user, true])
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
    if (userToChoose[0] == user) {
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
    privateWord = wordToGuess[0]
    encodedWord = wordToGuess[1]
}

function showUserAttempt(userAttempt) {
    let wordIsComplete = true;
    var chatScroll = document.getElementById('chatMessages');
    let currentChat = document.getElementById('chatMessages').innerHTML;
    document.getElementById('chatMessages').innerHTML = currentChat + `<br>- ${userAttempt[1]}: ${userAttempt[0]}`;
    chatScroll.scrollTop = chatScroll.scrollHeight;

    if (userAttempt[2]) return;

    if (userAttempt[0].length === 1) {
        var matches = []
        privateWord.split("").forEach((value, index) => {
            console.log(`${index} -> ${value}`)
            if (value === userAttempt[0]) {
                matches.push(index)
            }
        })

        if (matches.length === 0) {
            allAttempts -= 1;
            return;
        } else {
            for (let [index, keyvalue] of matches.entries()) {
                encodedWord.split("").forEach((value, position) => {
                    if (value === "_" && position === keyvalue * 2) {
                        document.getElementById('chatMessages').innerHTML += `<br><strong><span style="color: green;">★ ${userAttempt[1]} has guessed letter ${userAttempt[0]}!</span></strong>`;
                        chatScroll.scrollTop = chatScroll.scrollHeight;
                        newWord.push(userAttempt[0])
                    } else {
                        newWord.push(value)
                    }
                });
                console.log(newWord)
                encodedWord = newWord.join("");
                console.log(encodedWord)

                if (index === matches.length - 1) {
                    console.log("Activate when about to finish this loop.")
                } else {
                    newWord = []
                }
            }

            newWord.forEach((value) => {
                if (value === "_") {
                    wordIsComplete = false;
                }
            });

            if (wordIsComplete) {
                document.getElementById('chatMessages').innerHTML = currentChat + `<br><strong><span style="color: green;">★ ${userAttempt[1]} has guessed the word! ( ${privateWord} )</span></strong>`
                document.getElementById('chatMessages').innerHTML += "<br>"
                document.getElementById('chatMessages').innerHTML += "<br><strong style='color: red'>⚠ Going back to lobby in 10 seconds... </strong>"
                chatScroll.scrollTop = chatScroll.scrollHeight;
                setTimeout(() => {
                    socket.emit('gameFinished')
                }, 7000)            
            }
        }
    } else {
        if (userAttempt[0] === privateWord) {
            document.getElementById('codedWord').innerHTML = userAttempt[0].split('').join(' ');
            document.getElementById('chatMessages').innerHTML += `<br><strong><span style="color: green;">★ ${userAttempt[1]} has guessed the word! ( ${privateWord} )</span></strong>`
            document.getElementById('chatMessages').innerHTML += "<br>"
            document.getElementById('chatMessages').innerHTML += "<br><strong style='color: red'>⚠ Going back to lobby in 10 seconds... </strong>"
            chatScroll.scrollTop = chatScroll.scrollHeight;
            setTimeout(() => {
                socket.emit('gameFinished')
            }, 7000)
        } else {
            allAttempts -= 1;
        }
    }

    if (newWord.length !== 0) {
        encodedWord = newWord.join("");
        document.getElementById('codedWord').innerHTML = encodedWord;
        newWord = [];
    }
    chatScroll.scrollTop = chatScroll.scrollHeight;
}

function resetGame() {
    document.getElementById('chatMessages').innerHTML = "";
    document.getElementById('chatContainer').style.display = 'none';
    document.getElementById('gamePanel').style.display = 'none';
    document.getElementById('readyStatus').style.color = 'red';
    document.getElementById('readyStatus').innerHTML = " (You are NOT ready) ";
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('startError').innerHTML = "";
    document.getElementById('privateWord').innerHTML = "";
    document.getElementById('wordToGuess').value = "";
    document.getElementById('userMessage').value = "";
    document.getElementById('MessageType').value = "Letter";

    userIsHost = false;
    userIsReady = false;
    allAttempts = 20;
    newWord = []

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
    if (inputText === "Letter" && userIsHost || inputText === "Word" && userIsHost) {
        document.getElementById('userMessage').disabled = true;
    } else {
        document.getElementById('userMessage').disabled = false;
    }
}