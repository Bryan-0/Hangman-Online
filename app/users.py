import random

class Users:
    
    def __init__(self):
        self.userList = []
        self.readyCounter = 0
        self.gameStarted = False
        self.privateWord = ""
    
    def getUserList(self):
        return self.userList

    def getReadyCounter(self):
        return self.readyCounter
    
    def getPrivateWord(self):
        return self.privateWord
    
    def getUsersReady(self):
        output = []
        for users in self.userList:
            if users['userIsReady']:
                output.append(users['userName'])
        return output

    def isGameStarted(self):
        return self.gameStarted

    def setGameStatus(self, status):
        self.gameStarted = status
    
    def setPrivateWord(self, privateWord):
        self.privateWord = privateWord

    def addReadyCounter(self):
        self.readyCounter += 1

    def minusReadyCounter(self):
        self.readyCounter -= 1
    
    def addUserToList(self, user):
        self.userList.append(user)
    
    def prepareUser(self, user):
        for index, value in enumerate(self.userList):
            if value['userName'] == user:
                self.userList[index] = {'userName': value['userName'], 'userIsReady': True, 'userHasLost': False, 'userIsHost': False}
    
    def unprepareUser(self, user):
        for users in self.userList:
            if users['userName'] == user:
                users['userIsReady'] = False

    def removeUserFromList(self, user):
        for index, value in enumerate(self.userList):
            if value['userName'] == user:
                if self.userList[index]['userIsReady']:
                    self.minusReadyCounter()
                    self.userList.pop(index)
                else:
                    self.userList.pop(index)
    
    def isUniqueUserName(self, user):
        for names in self.userList:
            if user == names['userName']:
                return False
        return True
    
    def allPlayersReady(self):
        for readyStatus in self.userList:
            if readyStatus['userIsReady']:
                continue
            return False
        return True

    def allUsersLost(self):
        for usersStatus in self.userList:
            if usersStatus['userHasLost']:
                continue
            return False
        return True
    
    def setPlayerLostStatus(self, userWhoLost):
        for user in self.userList:
            if user['userName'] == userWhoLost:
                user['userHasLost'] = True
    
    def setPlayerAsHost(self, userToBeHost):
        for user in self.userList:
            if user['userName'] == userToBeHost:
                user['userIsHost'] = True
    
    def isHost(self, userName):
        for user in self.userList:
            if user['userName'] == userName:
                if user['userIsHost']:
                    return True
        return False
    
    def chooseRandomPlayer(self):
        return random.choice(self.userList)

    def clearUserList(self):
        self.userList.clear()
    
    def clearReadyCounter(self):
        self.readyCounter = 0
    
    def clearUserStatus(self):
        for users in self.userList:
            users['userIsReady'] = False
            users['userHasLost'] = False
            users['userIsHost'] = False
    
    def clearPrivateWord(self):
        self.privateWord = ""