import unittest
import time

from dailyevents.api import ParseClient

class AcceptanceTest(unittest.TestCase):
    
    def test_should_create_group(self):
        groupId = self.__createGroup()
        assert groupId
        group = self.__getGroupById(groupId)
        assert group['code']
        group = self.__getGroupByCode(group['code'])
        assert group['id']
    
    def test_should_confirm_and_cancel_attendance(self):
        groupId = self.__createGroup()
        participants = {
            'tfernandez' : 'yes',
            'ewatanabe'  : 'yes',
            'gliguori'   : 'yes'
        }
        for participant, reply in participants.items():
            self.__setStatus(participant + '-device', groupId, participant, reply)
        assert len(self.__getStatuses(groupId)) == len(participants)
        
        self.__setStatus('gliguori-device', groupId, 'gliguori', 'no')
        statuses = self.__getStatuses(groupId)
        assert len(statuses) == len(participants)
        assert statuses[len(statuses) - 1]['reply'] == 'no'

    def test_should_add_comments(self):
        groupId = self.__createGroup()
        comments = {
            'tfernandez' : 'first comment',
            'ewatanabe'  : 'second comment',
            'gliguori'   : 'third comment'
        }
        for participant, comment in comments.items():
            self.__addComment(groupId, participant, comment)
        assert len(self.__getComments(groupId)) == len(comments)

    def __createGroup(self):
        response = self.__function('createGroup', {
                'name' : 'Acceptance Test'
            })
        return response['result']['id']

    def __getGroupById(self, groupId):
        return self.__function('getGroupById', {
                'id' : groupId
            })['result']

    def __getGroupByCode(self, groupCode):
        return self.__function('getGroupByCode', {
                'code' : groupCode
            })['result']

    def __setStatus(self, clientId, groupId, participant, reply):
        return self.__function('setStatus', {
                'clientId'    : clientId,
                'groupId'     : groupId,
                'participant' : participant,
                'reply'       : reply,
                'timestamp'   : self.__timestamp(),
                'timezone'    : self.__timezone()
            })

    def __addComment(self, groupId, participant, comment):
        return self.__function('addComment', {
                'clientId'    : 'test-device',
                'groupId'     : groupId,
                'participant' : participant,
                'comment'     : comment,
                'timestamp'   : self.__timestamp(),
                'timezone'    : self.__timezone()
            })

    def __getStatuses(self, groupId):
        return self.__getEvent(groupId)['statuses']

    def __getComments(self, groupId):
        return self.__getEvent(groupId)['comments']

    def __getEvent(self, groupId):
        return self.__function('getEvent', {
                'groupId'   : groupId,
                'timestamp' : self.__timestamp(),
                'timezone'  : self.__timezone()
            })['result']

    def __function(self, name, params={}):
        return ParseClient().call_function(name, params)

    def __timestamp(self):
        return str(time.time() * 1000)

    def __timezone(self):
        return str(time.altzone / 60)
