from bs4 import BeautifulSoup
import requests

myheaders = {"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0(HTTP_USER_AGENT)"}


base_url = "https://www.commonsensemedia.org/search/"
url_query = "?f%5B0%5D=field_reference_review_ent_prod%253Atype%3Acsm_movie&f%5B1%5D=field_reference_review_ent_prod%253Atype%3Acsm_tv"

f = open("./topShows.txt", "r", encoding="UTF-8")
success = open("./rated_shows.csv", "w", encoding="UTF-8")
failure = open("./not_rated_shows.txt", "w", encoding="UTF-8")

line = f.readline()

while line: 
    url = "{}{}{}".format(base_url, line, url_query)
    resp = requests.get(url, headers = myheaders)
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    div_content = soup.select("div.view-content")
    
    if(len(div_content) == 0):
        print("{} not found".format(line[:len(line) - 1]))
        failure.write("{}".format(line))
        line = f.readline()
        continue

    div_content = div_content[0]
    names = [item.string for item in div_content.select("strong.field-content > a")]
    ratings = [item.contents[1] for item in div_content.select("div.csm-green-age")]
    try:
        i = names.index(line[:len(line) - 1])

        success.write("{},{}\n".format(names[i], ratings[i].split()[1][:-1]))
        print("{} {}".format(names[i], ratings[i]))
    except Exception as e:
        failure.write("{}".format(line))
        print(e)
    line = f.readline()

success.close()
failure.close()
f.close()