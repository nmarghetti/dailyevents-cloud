import unittest

from dailyevents.api import ParseClient

class AcceptanceTest(unittest.TestCase):
  
  def test_should_create_group(self):
    assert self.__createGroup()
  
  def test_should_confirm_and_cancel_attendance(self):
    group = self.__createGroup()
    self.__function('rsvp', {
        'group'       : group,
        'timestamp'   : '1367447163104',
        'timezone'    : '-120',
        'participant' : 'tfernandez',
        'reply'       : 'yes'
      })
    # TODO Assert one person is attending
    self.__function('rsvp', {
        'group'       : group,
        'timestamp'   : '1367447166194',
        'timezone'    : '-120',
        'participant' : 'tfernandez',
        'reply'       : 'no'
      })
    # TODO Assert nobody is attending

  def __createGroup(self):
    response = self.__function('createGroup')
    return response['result']['code']

  def __function(self, name, params={}):
    return ParseClient().call_function(name, params)
