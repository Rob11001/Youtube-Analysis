# Youtube Analysis

TODO: Setup Node.js environment

125 shows.
10000 quota per day.

## Data Collection
First, we collected the 125 top children's shows based on [Ranker](https://www.ranker.com/crowdranked-list/my-favorite-cartoons-of-all-time?ref=search), a website in which users can rank shows and films, this list in particular has 3.2m votes
from 194.0k voters and was recently updated.

Next, we used another site, [Common Sense Media](https://www.commonsensemedia.org/), an organization that provides advices to families about safe media for children. We used their site to fetch the appropriate age group for our shows, this was successful for 95 shows. 
For the remaining 30 shows, we used the [OMDb API](http://www.omdbapi.com/) a RESTful web service to obtain movie information, here we got 18 of the remaining shows' age group.
The age group for the last 12 shows was looked up manually on the web. 

## Phase 1
We used Youtube Data API (Search resource type) to collect the data of the first 10 videos for each show. However some videos did not have comments attached to it, or the comments were disabled, so we decided to collect the 50 most relevant videos and take the first 10 that matched our conditions. Not all shows got to 10 videos, but the average number of videos per show is 9.68, still very close to 10.

## Phase 2
Using Videos resource type of Youtube Data API, during Phase 2, we collecte some statistics for each video we found, these are:
- views,
- likes,
- dislikes,
- comments.

Phase 2 was executed along with Phase 1 to check the number of comments, likes and dislikes and to avoid problems related to the Quota of Youtube Data API. We also used this step to check if all the statistics we looked for were defined for each video.

## Phase 3
TODO: Use CommentThread to get all comments.
