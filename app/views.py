from app import datetime, app, render_template, Response, request, redirect, url_for, send_from_directory, session, send, emit, socketio
from app import users

UsersConfig = users.Users()

@app.route("/")
def index_page():
	try:
		Error = request.args['error']
		if (Error == "GameAlreadyStarted"):
			return render_template('index.html', invalid="Game already started! Please wait until the game has finished.")
		elif (Error == "EmptyUserName"):
			return render_template('index.html', invalid="Don't leave nickname empty!")
		return render_template('index.html', invalid="The nickname you choose is already in lobby! Choose a different one.")
	except:
		pass
	
	return render_template('index.html')

@app.route("/game", methods=['POST', 'GET'])
def lobby_page():
	userName = request.form['userName']

	if (UsersConfig.isGameStarted()):
		return redirect(url_for('index_page', error="GameAlreadyStarted"))
	
	if (len(userName) <= 0):
		return redirect(url_for('index_page', error="EmptyUserName"))

	if (UsersConfig.isUniqueUserName(userName)):		
		session['currentUser'] = {'userName': userName, 'userIsReady': False, 'userHasLost': False, 'userIsHost': False}
		return render_template('game.html', userName = userName)
	else:
		return redirect(url_for('index_page', error="UserNameNotUnique"))

@socketio.on('connect')
def connection():
	emit('getUserList', UsersConfig.getUserList())
	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), UsersConfig.getUsersReady()])

@socketio.on('disconnect')
def disconnection():
	resetGame = False
	hostLeaved = False

	if (UsersConfig.isHost(session['currentUser']['userName']) and UsersConfig.isGameStarted()):
		UsersConfig.setGameStatus(False)
		UsersConfig.clearPrivateWord()
		UsersConfig.clearReadyCounter()
		UsersConfig.clearUserStatus()
		resetGame = True
		hostLeaved = True

	UsersConfig.removeUserFromList(session['currentUser']['userName'])

	if (len(UsersConfig.getUserList()) <= 1 and UsersConfig.isGameStarted()):
		UsersConfig.setGameStatus(False)
		UsersConfig.clearPrivateWord()
		UsersConfig.clearReadyCounter()
		UsersConfig.clearUserStatus()
		resetGame = True

	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), UsersConfig.getUsersReady()], broadcast = True)
	emit('removeUser', session['currentUser'], broadcast = True)

	print(UsersConfig.getUserList())
	
	if resetGame:
		print(UsersConfig.getUserList())
		emit('resetGame', broadcast = True)
	if hostLeaved:
		emit('hostLeaved', session['currentUser']['userName'], broadcast = True)

	session.pop('currentUser', None)

@socketio.on('AddUserName')
def add_user(user):
	UsersConfig.addUserToList(session['currentUser']) 
	print(UsersConfig.getUserList())
	emit('updateUserList', user, broadcast = True, include_self = False)

@socketio.on('userReady')
def prepare_user(userToPrepare):
	UsersConfig.addReadyCounter()
	UsersConfig.prepareUser(userToPrepare)
	print(UsersConfig.getUserList())
	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), [userToPrepare]], broadcast = True)
	emit('updateSelfStatus')

@socketio.on('userUnReady')
def unprepare_user(userToUnPrepare):
	UsersConfig.minusReadyCounter()
	UsersConfig.unprepareUser(userToUnPrepare)
	emit('quitReadySymbolFromTable', userToUnPrepare, broadcast = True)
	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), UsersConfig.getUsersReady()], broadcast = True)

@socketio.on('startGameRequest')
def start_game_request():
	if UsersConfig.allPlayersReady() and len(UsersConfig.getUserList()) >= 2:
		UsersConfig.setGameStatus(True)
		selectedUserName = UsersConfig.chooseRandomPlayer()
		UsersConfig.setPlayerLostStatus(selectedUserName['userName'])
		print(UsersConfig.getUserList())
		UsersConfig.setPlayerAsHost(selectedUserName['userName'])
		emit('startGameProcess', selectedUserName, broadcast = True)
		emit('chooseWord', selectedUserName, broadcast = True)
	else:
		emit('startGameError', broadcast = True)

@socketio.on('startGameOficially')
def start_game_officially(wordToGuess):
	codedWord = len(wordToGuess) * " _"
	UsersConfig.setPrivateWord(wordToGuess)
	emit('startGameForAll', [wordToGuess, codedWord[1:]], broadcast = True)

@socketio.on('userAttempt')
def user_attempt(userAttempt):
	emit('showUserAttempt', userAttempt, broadcast = True)

@socketio.on('userAttemptFail')
def user_fail(userWhoFail):
	emit('removeAttempt', userWhoFail)

@socketio.on('userLost')
def user_lost(userWhoLost):
	UsersConfig.setPlayerLostStatus(userWhoLost['userName'])
	emit('userLostResponse', userWhoLost, broadcast = True)

	if (UsersConfig.allUsersLost()):
		emit('noOneGuessedTheWord', UsersConfig.getPrivateWord(), broadcast = True)

@socketio.on('userCommand')
def user_command(userInformation):
	if userInformation['isHost']:
		emit('userUsedCommand', userInformation, broadcast = True)
	else:
		emit('notEnoughAuthority')

@socketio.on('gameFinished')
def game_finished():
	UsersConfig.setGameStatus(False)
	UsersConfig.clearUserStatus()
	UsersConfig.clearReadyCounter()
	UsersConfig.clearPrivateWord()
	print(UsersConfig.getUserList())
	
	emit('resetGame', broadcast = True)
	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), UsersConfig.getUsersReady()], broadcast = True)
