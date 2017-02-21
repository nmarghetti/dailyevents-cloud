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
             'X-Parse-Application-Id' : 'OM6MTeOzj8Y5exBdXTCgCB97JqY1KaVOCFjEvcXJ',
             'X-Parse-REST-API-Key'   : 'vLVQmSP1iKBVK5XyiAmXiROD0VfvW7SjT5afwcn9',
             'Content-Type'           : 'application/json'
            })
        response = self.connection.getresponse().read().decode()
        print(response)
        return json.loads(response)
