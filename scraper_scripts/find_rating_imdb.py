import requests
import json
import constants

myheaders = {"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0(HTTP_USER_AGENT)"}

base_url = "http://www.omdbapi.com/?apikey={}".format(constants.API_KEY)

f = open("./not_rated_shows.txt", "r", encoding="UTF-8")
success = open("./other_rated_shows.csv", "w", encoding="UTF-8")
failure = open("./remaining_shows", "w", encoding="UTF-8")
line = f.readline()

while(line):
    try:       
        url = "{}&t={}".format(base_url, line[:-1])
        res = requests.get(url, headers = myheaders)
        res = json.loads(res.text)
        
        if(res["Response"] == 'True'):
            success.write("{},{}\n".format(line[:-1], res['Rated']))
            print("{},{}".format(line[:-1], res['Rated']))
        else:
            failure.write(line)
            print("{} non trovato".format(line[:-1]))
    except Exception as e:
        print(e)
    
    line = f.readline()

f.close()
success.close()
failure.close()