
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'myapp.settings'

from movies.models import Movie,Tag
from collections import Counter
from pymongo import MongoClient


def init_mongo(database,collection):
        connect = MongoClient('localhost', 27017)#, max_pool_size=None)
        db = connect[database]
        global collect
        # collect = db.movie_list
        collect = db[collection]


init_mongo('fc2_movie','all_non_adult_movies')
for i,movie in enumerate(collect.find({},{'rate':0,'flv_url':0,'kind':0})):
    if movie['playing'] < 1000:
        continue
    print(i)
    movie['id']=movie.pop('_id')
    movie['tag'] = ','.join(movie['tag'])
    movie['is_adult'] = 0
    Movie(**movie).save()

movies = Movie.objects.filter(is_adult=0).values()
print('finish Movie')
tags = []
for movie in movies:
    tags.extend(movie['tag'].split(','))
tags = Counter(tags).most_common(1000)
for tag in tags:
    tag = {'tag':tag[0],'num':tag[1],'is_adult':0}
    Tag(**tag).save()