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
            if users[1]:
                output.append(users[0])
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
        for index, name in enumerate(self.userList):
            if name[0] == user:
                self.userList[index] = [name[0], True, False]
    
    def removeUserFromList(self, user):
        for index, name in enumerate(self.userList):
            if name[0] == user:
                if self.userList[index][1]:
                    self.minusReadyCounter()
                    self.userList.pop(index)
                else:
                    self.userList.pop(index)
    
    def isUniqueUserName(self, user):
        for names in self.userList:
            if user == names[0]:
                return False
        return True
    
    def allPlayersReady(self):
        for readyStatus in self.userList:
            if readyStatus[1]:
                continue
            return False
        return True

    def allUsersLost(self):
        for usersStatus in self.userList:
            if usersStatus[2]:
                continue
            return False
        return True
    
    def setPlayerLostStatus(self, userWhoLost):
        for user in self.userList:
            if user[0] == userWhoLost:
                user[2] = True
    
    def chooseRandomPlayer(self):
        return random.choice(self.userList)

    def clearUserList(self):
        self.userList.clear()
    
    def clearReadyCounter(self):
        self.readyCounter = 0
    
    def clearUserStatus(self):
        for users in self.userList:
            users[1] = False
            users[2] = False
    
    def clearPrivateWord(self):
        self.privateWord = ""