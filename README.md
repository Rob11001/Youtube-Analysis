# Youtube Analysis

123 shows.
10000 quota per day.

## Phase 1: Data Collection
First, we collected the 123 top children's shows based on [Ranker](https://www.ranker.com/crowdranked-list/my-favorite-cartoons-of-all-time?ref=search), a website in which users can rank shows and films, this list in particular has 3.2m votes
from 194.0k voters and was recently updated.

Next, we used another site, [Common Sense Media](https://www.commonsensemedia.org/), an organization that provides advices to families about safe media for children. We used their site to fetch the appropriate age group for our shows, this was successful for 95 shows. 
For the remaining 30 shows, we used the [OMDb API](http://www.omdbapi.com/) a RESTful web service to obtain movie information, here we got 18 of the remaining shows' age group.
The age group for the last 10 shows was looked up manually on the web. 

## Phase 2: Collecting videos data
We used Youtube Data API (Search resource type) to collect the data of the first 10 videos for each show. However some videos did not have comments attached to it, or the comments were disabled, so we decided to collect the most relevant videos until we found 10 of them that matched our conditions. 

Using Videos resource type of Youtube Data API, we collected some statistics for each video we found, these are:
- views,
- likes,
- dislikes,
- comments.

We also used this step to check if all the statistics we looked for were defined for each video. Since Youtube does not provide a way to check if video's comments have been disabled, we had to use the CommentThread to check if we were able to collect the comments. 

All the collected data were stored as a dataset file (.csv) and as a JSON file.

## Phase 3: Videos data analysis
We started analyzing all data retrieved from the API to get some statistics and charts about videos and compare that with the age group we found for each show in the previous phase.


## Phase 3
TODO: Use CommentThread to get all comments.
Unavailable videos for now: 17
