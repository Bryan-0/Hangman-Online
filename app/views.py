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
		session['currentUser'] = [userName, False, False]
		return render_template('game.html', userName = userName)
	else:
		return redirect(url_for('index_page', error="UserNameNotUnique"))

@socketio.on('connect')
def connection():
	emit('getUserList', UsersConfig.getUserList())
	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), UsersConfig.getUsersReady()])

@socketio.on('disconnect')
def disconnection():
	UsersConfig.removeUserFromList(session['currentUser'][0])

	if (len(UsersConfig.getUserList()) <= 1):
		UsersConfig.setGameStatus(False)
		UsersConfig.clearPrivateWord()

	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), UsersConfig.getUsersReady()], broadcast = True)
	emit('removeUser', session['currentUser'], broadcast = True)

	session.pop('currentUser', None)
	print(UsersConfig.getUserList())

@socketio.on('AddUserName')
def add_user(user):
	UsersConfig.addUserToList(session['currentUser']) 
	# TODO: change lists to dictionaries.
	# [0] = userName, [1] = userIsReady, [2] = userLost
	print(UsersConfig.getUserList())
	emit('updateUserList', user, broadcast = True, include_self = False)

@socketio.on('userReady')
def prepare_user(userToPrepare):
	UsersConfig.addReadyCounter()
	UsersConfig.prepareUser(userToPrepare)
	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), [userToPrepare]], broadcast = True)
	emit('updateSelfStatus')

@socketio.on('startGameRequest')
def start_game_request():
	if UsersConfig.allPlayersReady() and len(UsersConfig.getUserList()) >= 2:
		UsersConfig.setGameStatus(True)
		selectedUserName = UsersConfig.chooseRandomPlayer()
		UsersConfig.setPlayerLostStatus(selectedUserName[0])
		print(UsersConfig.getUserList())
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
	emit('showUserAttempt', [userAttempt[0], userAttempt[1], userAttempt[2]], broadcast = True)

@socketio.on('userAttemptFail')
def user_fail(userWhoFail):
	emit('removeAttempt', userWhoFail)

@socketio.on('userLost')
def user_lost(userWhoLost):
	UsersConfig.setPlayerLostStatus(userWhoLost)
	emit('userLostResponse', userWhoLost, broadcast = True)

	if (UsersConfig.allUsersLost()):
		emit('noOneGuessedTheWord', UsersConfig.getPrivateWord(), broadcast = True)

@socketio.on('gameFinished')
def game_finished():
	UsersConfig.setGameStatus(False)
	UsersConfig.clearUserStatus()
	UsersConfig.clearReadyCounter()
	UsersConfig.clearPrivateWord()
	
	emit('resetGame', broadcast = True)
	emit('updateCounterAndUser', [UsersConfig.getReadyCounter(), UsersConfig.getUsersReady()], broadcast = True)
