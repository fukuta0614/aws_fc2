# -*- coding: utf-8 -*-

import requests
import re
import os
from bs4 import BeautifulSoup
import pprint
import hashlib
import multiprocessing as mp

# from pymongo import MongoClient
os.environ['DJANGO_SETTINGS_MODULE'] = 'fc2_matome.settings'
import django
django.setup()

from movies.models import Movie, Tag


pp = pprint.PrettyPrinter(indent=4)


def check_removed():
    for movie in Movie.objects.all():
        if movie.thumbnail == '' or requests.get(movie.thumbnail).status_code != 200:
            movie.delete()


def get_ginfo_url(target):
    FC2magick = '_gGddgPfeaf_gzyr'
    hash_target = (target + FC2magick).encode('utf-8')
    mini = hashlib.md5(hash_target).hexdigest()
    ginfo_url = 'http://video.fc2.com/ginfo.php?mimi=' + mini + '&v=' + target + '&upid=' + target + '&otag=1'
    return ginfo_url


def get_all_movie_info(base_url, max_page_num=2000, page_number=1,):

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

                entry = {
                    'url': url,
                    'title': title,
                    'thumbnail': movie.img['src'],
                    'id': target,
                    'play_time': play_time,
                    'ginfo_url': get_ginfo_url(target),
                    'is_adult': 1,
                    'movie_kind': kind,
                    'fav' : 0,
                    'playing' : 0,
                    'tag' : '',
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
                    except TimeoutException:
                        print('timeout')
                    except Exception as e:
                        print(str(e) + ' ' + entry['url'])

                    Movie(**entry).save()
                    print(entry['title'])

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

    driver = webdriver.PhantomJS()
    driver.desired_capabilities['javascriptEnabled'] = False

    driver.get("http://fc2.com/ja/login.php?ref=video")

    driver.find_element_by_name('email').send_keys('fukuta6140@yahoo.co.jp')
    driver.find_element_by_name('pass').send_keys('shun2live')
    driver.find_element_by_name("image").click()

    driver.set_page_load_timeout(10)

    # ranking 10
    # base_url = "http://video.fc2.com/a/list.php?m=cont&page={}&type=1"

    # trend 10
    # base_url = 'http://video.fc2.com/a/recentpopular.php?page={}'

    # all_movie
    base_url = 'http://video.fc2.com/ja/a/movie_search.php?keyword=&fq=HMV5&page={}'

    get_all_movie_info(base_url, page_number=67)
