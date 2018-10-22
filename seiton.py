# -*- coding: utf-8 -*-

import requests
import re
import os
from bs4 import BeautifulSoup
import pprint
import hashlib
from collections import Counter

import multiprocessing as mp

# from pymongo import MongoClient
os.environ['DJANGO_SETTINGS_MODULE'] = 'fc2_matome.settings'
import django
django.setup()

import sqlite3
from movies.models import Movie, Tag
import datetime
from django.utils import timezone
import multiprocessing as mp
import pytz
from bulk_update.helper import bulk_update
from django.db.utils import OperationalError
pp = pprint.PrettyPrinter(indent=4)


def get_info(movie):

    soup = BeautifulSoup(requests.get(movie['url']).content, "html.parser")
    if soup.find('h2', class_='cont_v2_hmenu04 clearfix'):
        title = soup.find('h2', class_='cont_v2_hmenu04 clearfix').text
        if 'Removed' in title or 'removed' in title:
            print('delete ', title)
            return movie, False
        if soup.find('p', class_='cont_v2_hmenu0101'):
            kind = soup.find('p', class_='cont_v2_hmenu0101').text
        elif soup.find('p', class_='cont_v2_hmenu0103'):
            kind = soup.find('p', class_='cont_v2_hmenu0103').text
        elif soup.find('p', class_='cont_v2_hmenu0105'):
            kind = soup.find('p', class_='cont_v2_hmenu0105').text
        else:
            raise AttributeError

        if kind == 'すべてのユーザー':
            kind = '全員'
        movie['movie_kind'] = kind
        movie['tag'] = ','.join([li.a.span.text for li in soup.find_all('li', class_='radius_all tag_lock')])
        movie['playing'] = int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[0].strong.text)
        if 0 < movie['playing'] < 5000:
            print(movie['playing'])
            return movie, False

        movie['fav'] = int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[1].strong.text)
        movie['sj'] = re.search(r'sj=(\w+)', str(soup)).group(1)
        movie['uploaded'] = pytz.timezone('UTC').localize(
            datetime.datetime.strptime(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[2].text.strip(),
                                       '%Y/%m/%d %H:%M:%S'))
        print('update', title, movie['playing'], movie['fav'])
        return movie, True

    elif soup.find('div', class_='video_title_block clearfix'):
        title = soup.find('div', class_='video_title_block clearfix').h2.text
        if 'Removed' in title or 'removed' in title:
            print('delete ', title)
            return movie, False

        kind = soup.find('div', class_='video_title_block clearfix').li.text
        movie['movie_kind'] = kind
        movie['tag'] = ','.join([li.a.span.text for li in soup.find_all('li', class_='radius_all tag_lock')])
        movie['playing'] = 5000
        movie['fav'] = 5000
        movie['sj'] = 1
        print('update', title, movie['movie_kind'], movie['playing'], movie['fav'])
        return movie, True
    elif '非公開' in str(soup) or "Removed" in str(soup):
        print('delete', movie['title'])
        return movie, False
    elif soup.find('h2', id='pagetitle'):
        if 'エラー' in soup.find('h2', id='pagetitle').text or 'error' in soup.find('h2', id='pagetitle').text:
            print('delete', movie['title'])
            return movie, False
    elif not soup.body:
        print('delete', movie['title'])
        return movie, False
    else:
        print('something wrong', movie['url'], movie['movie_kind'])
        return movie, True


def print_(movie):
    print(movie.url)

pool = mp.Pool(8)
entrys = []
for movie in Movie.objects.filter(playing=0):

    x = movie.__dict__
    del x['_state']
    movie, result = get_info(x)
    if result:
        Movie(**movie).save()
    else:
        Movie(**movie).delete()
    # entrys.append(x)
    # if len(entrys) == 8:
    #     results = pool.map(get_info, entrys)
    #     while True:
    #         try:
    #             for entry, result in results:
    #                 if result:
    #                     Movie(**entry).save()
    #                 else:
    #                     Movie(**entry).delete()
    #             else:
    #                 break
    #         except OperationalError:
    #             pass
    #
    #     entrys = []