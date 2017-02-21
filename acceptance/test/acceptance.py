import unittest
import platform
import time

from dailyevents.api import ParseClient


class AcceptanceTest(unittest.TestCase):


    def test_should_register_new_user(self):
        clientId = self.__register()
        assert clientId
    

    def test_should_create_and_retrieve_group(self):
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
        # Reply directly from web
        for participant, reply in participants.items():
            self.__setStatus(None, groupId, participant, reply)
        assert len(self.__getStatuses(groupId)) == len(participants)
        
        # Change status on device
        self.__setStatus('test-device', groupId, 'gliguori', 'no')
        statuses = self.__getStatuses(groupId)
        assert len(statuses) == len(participants)
        assert statuses[len(statuses) - 1]['reply'] == 'no'

        # Change status yet again on the web
        self.__setStatus(None, groupId, 'gliguori', 'yes')
        statuses = self.__getStatuses(groupId)
        assert len(statuses) == len(participants)
        assert statuses[len(statuses) - 1]['reply'] == 'yes'
        
        # Change status yet again on the same device
        self.__setStatus('test-device', groupId, 'gliguori', 'no')
        statuses = self.__getStatuses(groupId)
        assert len(statuses) == len(participants)
        assert statuses[len(statuses) - 1]['reply'] == 'no'
        
        # Modify display name and change status yet again on the same device
        self.__setStatus('test-device', groupId, 'gliguori-2', 'yes')
        statuses = self.__getStatuses(groupId)
        assert len(statuses) == len(participants)
        assert statuses[len(statuses) - 1]['reply'] == 'yes'


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


    def __register(self):
        response = self.__function('register', {
                'environment' : platform.platform()
            })
        return response['result']['id']


    def __createGroup(self):
        response = self.__function('createGroup', {
                'name'        : 'Acceptance Test',
                'description' : 'Group used for acceptance testing.',
                'time'        : '11:50'
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
        status = {
            'groupId'     : groupId,
            'participant' : participant,
            'reply'       : reply,
            'timestamp'   : self.__timestamp(),
            'timezone'    : self.__timezone()
        }
        if (clientId is not None):
            status['clientId'] = clientId

        return self.__function('setStatus', status)


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
