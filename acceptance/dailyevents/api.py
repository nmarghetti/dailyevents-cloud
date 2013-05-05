from urllib import request
import json, http.client

class ParseClient:
    
    def __init__(self):
        self.connection = http.client.HTTPSConnection('api.parse.com', 443)
        self.connection.connect()
    
    def call_function(self, name, params={}):
        path = "/1/functions/{0}".format(name)
        print('\n' + path)
        self.connection.request('POST', path, json.dumps(params), {
             'X-Parse-Application-Id' : 'uI57rIax4Tk31J5dI9EUKR3dCDhaeNphH2D0MmG1',
             'X-Parse-REST-API-Key'   : 'kNPRXb7CGw0wkYiK9DtBnGWAtOgdyX6yqQqLMY2X',
             'Content-Type'           : 'application/json'
            })
        response = self.connection.getresponse().read().decode()
        print(response)
        return json.loads(response)
