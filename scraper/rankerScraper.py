from bs4 import BeautifulSoup
import requests

# we saved locally the webpage cointaining the ranks
# https://www.ranker.com/crowdranked-list/my-favorite-cartoons-of-all-time?ref=search
f = open("./ranker.html", "r", encoding='UTF-8')
text = f.read()
soup = BeautifulSoup(text, 'html.parser')

selector = "a.gridItem_name__3zasT.gridItem_nameLink__3jE6V,h2.gridItem_name__3zasT"
links = soup.select(selector)

for link in links:
  print("{}".format(link.text)) # outputted on a file

f.close()