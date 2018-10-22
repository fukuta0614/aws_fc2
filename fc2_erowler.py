# -*- coding: utf-8 -*-

import requests
import re
import os
from bs4 import BeautifulSoup
import pprint
import hashlib
from collections import Counter

import multiprocessing as mp
from multiprocessing.pool import ThreadPool

# from pymongo import MongoClient
os.environ['DJANGO_SETTINGS_MODULE'] = 'fc2_matome.settings'
import django
django.setup()

import sqlite3
from movies.models import Movie, Tag
import datetime
from django.utils import timezone
import pytz
from django.db.utils import OperationalError
import time

pp = pprint.PrettyPrinter(indent=4)
hangle = re.compile(r'[가-힣]')
time_to_sec_regex = re.compile(r'(\d+):(\d+)')


def get_info(movie):

    soup = BeautifulSoup(requests.get(movie['url']).content, "html.parser")
    if soup.find('h2', class_='cont_v2_hmenu04 clearfix'):
        title = soup.find('h2', class_='cont_v2_hmenu04 clearfix').text
        if 'Removed' in title or 'removed' in title:
            # print('delete ', title)
            return movie, False
        if soup.find('p', class_='cont_v2_hmenu0101'):
            kind = soup.find('p', class_='cont_v2_hmenu0101').text
        elif soup.find('p', class_='cont_v2_hmenu0103'):
            kind = soup.find('p', class_='cont_v2_hmenu0103').text
        elif soup.find('p', class_='cont_v2_hmenu0105'):
            kind = soup.find('p', class_='cont_v2_hmenu0105').text
        elif soup.find('p',class_='cont_v2_hmenu0104 txt_shadow04 grd_silver02'):
            if '非公開' in soup.find('p',class_='cont_v2_hmenu0104 txt_shadow04 grd_silver02').text:
                return movie, False
        else:
            print('something wrong', movie['url'], movie['movie_kind'])
            return movie, True

        if kind == 'すべてのユーザー':
            kind = '全員'
        movie['movie_kind'] = kind
        movie['tag'] = ','.join([li.a.span.text for li in soup.find_all('li', class_='radius_all tag_lock')])
        movie['playing'] = int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[0].strong.text)
        if 0 < movie['playing'] < 5000:
            # print(movie['playing'])
            return movie, False

        movie['fav'] = int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[1].strong.text)
        movie['sj'] = re.search(r'sj=(\w+)', str(soup)).group(1)
        movie['uploaded'] = pytz.timezone('UTC').localize(
            datetime.datetime.strptime(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[2].text.strip(),
                                       '%Y/%m/%d %H:%M:%S'))
        # print('update', title, movie['playing'], movie['fav'])
        return movie, True

    elif soup.find('div', class_='video_title_block clearfix'):
        title = soup.find('div', class_='video_title_block clearfix').h2.text
        if 'Removed' in title or 'removed' in title:
            # print('delete ', title)
            return movie, False

        kind = soup.find('div', class_='video_title_block clearfix').li.text
        movie['movie_kind'] = kind
        movie['tag'] = ','.join([li.a.span.text for li in soup.find_all('li', class_='radius_all tag_lock')])
        movie['playing'] = 5000
        movie['fav'] = 1
        movie['sj'] = '1'
        # print('update', title, movie['movie_kind'], movie['playing'], movie['fav'])
        return movie, True
    elif '非公開' in str(soup) or "Removed" in str(soup):
        # print('delete', movie['title'])
        return movie, False
    elif soup.find('h2', id='pagetitle'):
        if 'エラー' in soup.find('h2', id='pagetitle').text or 'error' in soup.find('h2', id='pagetitle').text:
            # print('delete', movie['title'])
            return movie, False
    elif not soup.body:
        # print('delete', movie['title'])
        return movie, False
    elif not soup.find('embed'):
        return movie, False
    else:
        print('something wrong', movie['url'], movie['movie_kind'])
        return movie, True


def get_ginfo_url(target):
    FC2magick = '_gGddgPfeaf_gzyr'
    hash_target = (target + FC2magick).encode('utf-8')
    mini = hashlib.md5(hash_target).hexdigest()
    ginfo_url = 'http://video.fc2.com/ginfo.php?mimi=' + mini + '&v=' + target + '&upid=' + target + '&otag=1'
    return ginfo_url


def get_all_movie_info(base_url, max_page_num=20000, page_number=1, is_adult=1, info=''):

    while page_number <= max_page_num:
        print(page_number, end='')
        try:
            soup = BeautifulSoup(requests.get(base_url.format(page_number), timeout=5).content,  "html.parser")

            for movie in soup.find('div', id='video_list_1column').find_all('div', class_="video_list_renew clearfix"):
                url = movie.find('div', class_='video_info_right').h3.a['href'].split('&')[0].split('?')[0]
                match = re.search(r"http://video\.fc2\.com(?:/ja)?(?:/a)?/content/(\w+)/?$", url)
                if match is None:
                    print('no match', url)
                    continue
                target = match.group(1)

                # if Movie.objects.filter(id=target).exists():
                #     continue

                play_time = movie.find('span', class_='video_time_renew').text
                try:
                    play_time_sec = int(time_to_sec_regex.search(play_time).group(1)) * 60 + int(time_to_sec_regex.search(play_time).group(2))
                except:
                    continue
                if play_time_sec < 300:
                    # print('too short')
                    continue

                title = movie.find('div', class_='video_info_right').h3.a.text
                if hangle.search(title):
                    continue

                kind = movie.find('ul', class_='video_info_upper_renew clearfix').li.text
                thumbnail = movie.find('div',class_='video_list_renew_thumb').img['src']
                entry = {
                    'url': url,
                    'title': title,
                    'thumbnail': thumbnail,
                    'thumbnail_digest': '/'.join(thumbnail.split('/')[:-1]) + '/digest_' + thumbnail.split('/')[-1].split('.')[0] + '.gif',
                    'thumbnail_seek': '/'.join(thumbnail.split('/')[:-1]) + '/seek_' + thumbnail.split('/')[-1].split('.')[0] + '.jpg',
                    'id': target,
                    'play_time': play_time,
                    'play_time_sec': play_time_sec,
                    'ginfo_url': get_ginfo_url(target),
                    'is_adult': is_adult,
                    'movie_kind': kind,
                    'sj': '0',
                    'fav': 0,
                    'playing': 0,
                    'tag': '',
                    'info': info,
                    'suggests': '',
                    'added': timezone.now(),
                    'uploaded': timezone.now()
                }
                if not Movie.objects.filter(id=target).exists():
                    print(title)
                Movie(**entry).save()

            page_number += 1

        except KeyboardInterrupt:
            exit()

        except Exception as e:
            print('-----------------------------------')
            print(e)
            print(url)
            print('-----------------------------------')
            continue


def get_suggest_info():
    print('trend ', Movie.objects.filter(info='trend').count())
    for i, movie in enumerate(Movie.objects.filter(info='trend')):
        if not (movie.movie_kind == '全員' or movie.movie_kind == '有料会員'):
            continue

        orig_url = movie.url.split('&')[0].split('?')[0]

        try:
            driver.get(orig_url)
            element_present = EC.presence_of_element_located((By.CSS_SELECTOR, 'div.video_thumb_small.clsThumbToAlbum'))
            WebDriverWait(driver, 30).until(element_present)
            # print(i, 'page ready!')
        except TimeoutException:
            print("Loading took too much time!")
            continue

        soup = BeautifulSoup(driver.page_source.encode('utf-8'), 'html.parser')

        suggests = []

        size_menu = soup.find('div', id='wrap_reco')
        if not size_menu:
            print('something wrong', orig_url)
            continue
        for li in size_menu.find_all('li', class_='clearfix'):
            url = li.a['href'].split('&')[0].split('?')[0]

            match = re.search(r"http://video\.fc2\.com(?:/\w{2})?(?:/a)?/content/(\w+)/?$", url)
            if match is None:
                # print(orig_url, url)
                continue
            target = match.group(1)

            suggests.append(target)

            if Movie.objects.filter(id=target).exists():
                continue

            play_time = li.span.text
            play_time_sec = int(time_to_sec_regex.search(play_time).group(1)) * 60 + int(time_to_sec_regex.search(play_time).group(2))
            if play_time_sec < 300:
                continue

            title = li.h4.text
            if hangle.search(title):
                continue

            thumbnail = li.img['src']
            entry = {
                'url': url,
                'title': title,
                'thumbnail': thumbnail,
                'thumbnail_digest': '/'.join(thumbnail.split('/')[:-1]) + '/digest_' +
                                    thumbnail.split('/')[-1].split('.')[0] + '.gif',
                'thumbnail_seek': '/'.join(thumbnail.split('/')[:-1]) + '/seek_' + thumbnail.split('/')[-1].split('.')[
                    0] + '.jpg',
                'id': target,
                'play_time': play_time,
                'play_time_sec': play_time_sec,
                'ginfo_url': get_ginfo_url(target),
                'is_adult': 1,
                'movie_kind': '',
                'sj': '0',
                'fav': 0,
                'playing': 0,
                'tag': '',
                'info': 'trend',
                'suggests': '',
                'added': timezone.now(),
                'uploaded': timezone.now()
            }

            Movie(**entry).save()
            print(title)
        movie.suggests = ','.join(suggests)
        # print(movie.suggests)
        movie.save()

    return


def daily():

    # delete removed
    print('delete removed')
    for movie in Movie.objects.filter(updated__date__lt=timezone.now() - datetime.timedelta(days=5)):
        movie.info=''
        if movie.thumbnail == '':  # or requests.get(movie.thumbnail).status_code != 200:
            movie.delete()
        else:
            movie.save()

    # get info
    pool = ThreadPool(8)
    entrys = []
    print('check favourite ')
    for movie in Movie.objects.order_by('-fav')[:1000]:
        x = movie.__dict__
        del x['_state']
        entrys.append(x)
        if len(entrys) == 100:
            results = pool.map(get_info, entrys)
            for entry, result in results:
                if result:
                    entry['info'] = ''
                    Movie(**entry).save()
                else:
                    Movie(**entry).delete()
            entrys = []

    print('get ranking and trend')
    # get ranking 10
    get_all_movie_info("http://video.fc2.com/a/list.php?m=cont&page={}&type=1", max_page_num=10, info='trend')
    get_all_movie_info("http://video.fc2.com/a/list.php?m=cont&page={}&type=2", max_page_num=10, info='')
    get_all_movie_info("http://video.fc2.com/a/list.php?m=cont&page={}&type=3", max_page_num=10, info='')

    # get trend 10
    get_all_movie_info('http://video.fc2.com/a/recentpopular.php?page={}', max_page_num=10, info='trend')

    # get suggest 10
    print('get suggest of trend')
    get_suggest_info()

    print('get info', Movie.objects.filter(playing=0).count())
    for movie in Movie.objects.filter(playing=0):
        x = movie.__dict__
        del x['_state']
        entrys.append(x)
        if len(entrys) == 100:
            results = pool.map(get_info, entrys)
            for entry, result in results:
                if result:
                    Movie(**entry).save()
                else:
                    Movie(**entry).delete()
            entrys = []
    else:
        results = pool.map(get_info, entrys)
        for entry, result in results:
            if result:
                Movie(**entry).save()
            else:
                Movie(**entry).delete()

    print('get tag')
    # calc Tag
    for i in range(2):
        movies = Movie.objects.filter(is_adult=i).values()
        tags = []
        for movie in movies:
            tags.extend(movie['tag'].split(','))
        tags = Counter(tags).most_common(1000)
        for tag in tags:
            if tag[0] == '':
                continue
            tag = {'tag': tag[0], 'num': tag[1], 'is_adult': i}
            Tag(**tag).save()


if __name__ == '__main__':

    from selenium import webdriver
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
    from selenium.webdriver.common.by import By

    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--type', '-t', default='daily')
    parser.add_argument('--page_num', '-p', default=1, type=int)
    parser.add_argument('--account', '-a', default=1, type=int)
    args = parser.parse_args()

    driver = webdriver.PhantomJS()
    # driver.desired_capabilities['javascriptEnabled'] = False

    driver.get("http://fc2.com/ja/login.php?ref=video")

    if args.account == 1:
        driver.find_element_by_name('email').send_keys('ksksk1124@yahoo.co.jp')
        driver.find_element_by_name('pass').send_keys('NX5e7mh7')
    else:
        driver.find_element_by_name('email').send_keys('fukuta6140@yahoo.co.jp')
        driver.find_element_by_name('pass').send_keys('shun2live')

    driver.find_element_by_name("image").click()
    # driver.set_page_load_timeout(10)

    scrape_type = args.type
    page_num = args.page_num

    if scrape_type == 'all_non':
        # all_non_adult_movie
        base_url = 'http://video.fc2.com/ja/movie_search.php?keyword=&fq=HMV5&page={}'
        get_all_movie_info(base_url, page_number=page_num, is_adult=0)

    elif scrape_type == 'all':
        base_url = 'http://video.fc2.com/ja/a/movie_search.php?keyword=&fq=HMV5&page={}'
        get_all_movie_info(base_url, page_number=page_num)

    elif scrape_type == 'daily':
        # driver.set_page_load_timeout(30)
        daily()
