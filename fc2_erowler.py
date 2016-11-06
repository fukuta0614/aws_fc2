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

from movies.models import Movie, Tag
import datetime
from django.utils import timezone
import pytz

pp = pprint.PrettyPrinter(indent=4)


def daily():

    now_aware = timezone.now()

    # update popular
    for movie in Movie.objects.filter.order_by('-fav')[:500]:
        soup = BeautifulSoup(requests.get(movie.url), "html.parser")
        title = movie.find('div', class_='video_info_right').h3.a.text
        if 'removed' in title:
            movie.delete()
        kind = movie.find('ul', class_='video_info_upper_renew clearfix').li.text

    # delete removed
    for movie in Movie.objects.all():
        if (now_aware - movie.updated).days > 3:
            if movie.thumbnail == '' or requests.get(movie.thumbnail).status_code != 200:
                movie.delete()

    # get ranking 10
    for i in range(1,4):
        get_all_movie_info("http://video.fc2.com/a/list.php?m=cont&page={1}&type={0}".format(i, "{}"), max_page_num=10, info='ranking')

    # get trend 10
    get_all_movie_info('http://video.fc2.com/a/recentpopular.php?page={}', max_page_num=10, info='trend')

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


def get_ginfo_url(target):
    FC2magick = '_gGddgPfeaf_gzyr'
    hash_target = (target + FC2magick).encode('utf-8')
    mini = hashlib.md5(hash_target).hexdigest()
    ginfo_url = 'http://video.fc2.com/ginfo.php?mimi=' + mini + '&v=' + target + '&upid=' + target + '&otag=1'
    return ginfo_url


def get_all_movie_info(base_url, max_page_num=20000, page_number=1, is_adult=1, info=''):

    hangle = re.compile(r'[가-힣]')
    time_to_sec = re.compile(r'(\d+):(\d+)')

    while page_number <= max_page_num:
        print(page_number)
        try:
            soup = BeautifulSoup(requests.get(base_url.format(page_number), timeout=5).content,  "html.parser")

            for movie in soup.find('div', id='video_list_1column').find_all('div', class_="video_list_renew clearfix"):
                url = movie.find('div', class_='video_info_right').h3.a['href'].split('&')[0].split('?')[0]
                match = re.search(r"http://video\.fc2\.com(?:/ja)?(?:/a)?/content/(\w+)/?$", url)
                if match is None:
                    print('####################################################')
                    print(url)
                    continue
                target = match.group(1)

                play_time = movie.find('span', class_='video_time_renew').text
                play_time_sec = int(time_to_sec.search(play_time).group(1)) * 60 + int(time_to_sec.search(play_time).group(2))
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
                    'fav' : 0,
                    'playing' : 0,
                    'tag': '',
                    'info': info,
                    'added': timezone.now(),
                    'uploaded': timezone.now()
                }
                if '全員' in kind:
                    try:
                        driver.get(entry['url'])
                        soup = BeautifulSoup(driver.page_source, "html.parser")
                        entry['playing'] = playing = int(
                            soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[0].strong.text)
                        if playing < 5000:
                            # print('too little played')
                            continue
                        entry['tag'] = ','.join([li.a.span.text for li in soup.find_all('li', class_='radius_all tag_lock')])
                        entry['fav'] = int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[1].strong.text)
                        entry['sj'] = re.search(r'sj=(\w+)', str(soup)).group(1)
                        entry['uploaded'] = pytz.timezone('UTC').localize(datetime.datetime.strptime(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[2].text.strip(), '%Y/%m/%d %H:%M:%S'))

                    except TimeoutException:
                        print('timeout')
                    except Exception as e:
                        print(str(e) + ' ' + entry['url'])

                    Movie(**entry).save()
                    print(entry['title'])

                else:
                    Movie(**entry).save()

            page_number += 1

        except KeyboardInterrupt:
            exit()

        except Exception as e:
            print('-----------------------------------')
            print(e)
            print('-----------------------------------')
            continue


if __name__ == '__main__':

    from selenium import webdriver
    from selenium.common.exceptions import TimeoutException
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--type', '-t', default='daily')
    parser.add_argument('--page_num', '-p', default=1, type=int)
    parser.add_argument('--account', '-a', default=1, type=int)
    args = parser.parse_args()

    driver = webdriver.PhantomJS()
    driver.desired_capabilities['javascriptEnabled'] = False

    driver.get("http://fc2.com/ja/login.php?ref=video")

    if args.account == 1:
        driver.find_element_by_name('email').send_keys('ksksk1124@yahoo.co.jp')
        driver.find_element_by_name('pass').send_keys('NX5e7mh7')
    else:
        driver.find_element_by_name('email').send_keys('fukuta6140@yahoo.co.jp')
        driver.find_element_by_name('pass').send_keys('shun2live')

    driver.find_element_by_name("image").click()
    driver.set_page_load_timeout(10)

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
        driver.set_page_load_timeout(30)
        daily()
