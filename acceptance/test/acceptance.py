import unittest
import time

from dailyevents.api import ParseClient

class AcceptanceTest(unittest.TestCase):
    
    def test_should_create_group(self):
        group = self.__createGroup()
        assert group
        assert self.__getGroup(group)['code']
    
    def test_should_confirm_and_cancel_attendance(self):
        group = self.__createGroup()
        participants = {
            'tfernandez' : 'yes',
            'ewatanabe'  : 'yes',
            'gliguori'   : 'yes'
        }
        for participant, reply in participants.items():
            self.__setStatus(group, participant, reply)
        assert len(self.__getStatuses(group)) == len(participants)
        
        self.__setStatus(group, 'gliguori', 'no')
        statuses = self.__getStatuses(group)
        assert len(statuses) == len(participants)
        assert statuses[len(statuses) - 1]['reply'] == 'no'

    def test_should_add_comments(self):
        group = self.__createGroup()
        comments = {
            'tfernandez' : 'first comment',
            'ewatanabe'  : 'second comment',
            'gliguori'   : 'third comment'
        }
        for participant, comment in comments.items():
            self.__addComment(group, participant, comment)
        assert len(self.__getComments(group)) == len(comments)

    def __createGroup(self):
        response = self.__function('createGroup')
        return response['result']['id']

    def __setStatus(self, group, participant, reply):
        return self.__function('setStatus', {
                'group'       : group,
                'participant' : participant,
                'reply'       : reply,
                'timestamp'   : self.__timestamp(),
                'timezone'    : self.__timezone()
            })

    def __addComment(self, group, participant, comment):
        return self.__function('addComment', {
                'group'       : group,
                'participant' : participant,
                'comment'     : comment,
                'timestamp'   : self.__timestamp(),
                'timezone'    : self.__timezone()
            })

    def __getStatuses(self, group):
        return self.__getGroupDetails(group)['statuses']

    def __getComments(self, group):
        return self.__getGroupDetails(group)['comments']

    def __getGroupDetails(self, group):
        return self.__function('getGroupDetails', {
                'group'     : group,
                'timestamp' : self.__timestamp(),
                'timezone'  : self.__timezone()
            })['result']

    def __getGroup(self, group):
        return self.__function('getGroup', {
                'group' : group
            })['result']

    def __function(self, name, params={}):
        return ParseClient().call_function(name, params)

    def __timestamp(self):
        return str(time.time() * 1000)

    def __timezone(self):
        return str(time.altzone / 60)
