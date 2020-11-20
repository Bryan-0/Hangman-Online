import random

class Users:
    
    def __init__(self):
        self.userList = []
        self.readyCounter = 0
        self.allAttempts = 20
        self.gameStarted = False
    
    def getUserList(self):
        return self.userList

    def getReadyCounter(self):
        return self.readyCounter
    
    def getAllAttempts(self):
        return self.allAttempts
    
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

    def addReadyCounter(self):
        self.readyCounter += 1

    def minusReadyCounter(self):
        self.readyCounter -= 1

    def minusAttempts(self):
        self.allAttempts -= 1
    
    def addUserToList(self, user):
        self.userList.append(user)
    
    def prepareUser(self, user):
        for index, name in enumerate(self.userList):
            if name[0] == user:
                self.userList[index] = [name[0], True]
    
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
    
    def chooseRandomPlayer(self):
        return random.choice(self.userList)

    def clearUserList(self):
        self.userList.clear()
    
    def clearReadyCounter(self):
        self.readyCounter = 0
    
    def clearUserStatus(self):
        for users in self.userList:
            users[1] = False