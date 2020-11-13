# Youtube Analysis

TODO: Setup Node.js environment

125 shows.
10000 quota per day.

## Data Collection
First, we collected the 125 top children's shows based on [Ranker](https://www.ranker.com/crowdranked-list/my-favorite-cartoons-of-all-time?ref=search), a website in which users can rank shows and films, this list in particular has 3.2m votes
from 194.0k voters and was recently updated.

Next, we used another site, [Common Sense Media](https://www.commonsensemedia.org/), an organization that provides advices to families about safe media for children. We used their site to fetch the appropriate age group for our shows, this was successful for 95 shows. 
For the remaining 30 shows, we used the [OMDb API](http://www.omdbapi.com/) a RESTful web service to obtain movie information, here we got 21 of the remaining shows' age group.
The age group for the last 9 shows was looked up manually on the web. 

## Phase 1
125 list search to get the 10 top videos. (100 quota per list)

## Phase 2
1250 list videos to get all videos statistics. (1 quota per list)

## Phase 3
TODO: Exctact comment number for each video and use CommentThread to get all comments.
