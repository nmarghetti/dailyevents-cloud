import unittest
import time

from dailyevents.api import ParseClient

class AcceptanceTest(unittest.TestCase):
  
  def test_should_create_group(self):
    assert self.__createGroup()
  
  def test_should_confirm_and_cancel_attendance(self):
    group = self.__createGroup()
    self.__rsvp(group, 'tfernandez', 'yes')
    # TODO Assert one person is attending
    self.__rsvp(group, 'tfernandez', 'no')
    # TODO Assert nobody is attending

  def test_should_add_comments(self):
    group = self.__createGroup()
    self.__addComment(group, 'tfernandez', 'first comment')
    self.__addComment(group, 'ewatanabe', 'second comment')
    self.__addComment(group, 'gliguori', 'third comment')
    # TODO Assert all comments were added

  def __createGroup(self):
    response = self.__function('createGroup')
    return response['result']['code']

  def __rsvp(self, group, participant, reply):
    return self.__function('rsvp', {
        'group'       : group,
        'timestamp'   : self.__timestamp(),
        'timezone'    : self.__timezone(),
        'participant' : participant,
        'reply'       : reply
      })

  def __addComment(self, group, participant, comment):
    return self.__function('addComment', {
        'group'       : group,
        'timestamp'   : self.__timestamp(),
        'timezone'    : self.__timezone(),
        'participant' : participant,
        'comment'     : comment
      })

  def __function(self, name, params={}):
    return ParseClient().call_function(name, params)

  def __timestamp(self):
    return str(time.time() * 1000)

  def __timezone(self):
    return str(time.altzone / 60)
