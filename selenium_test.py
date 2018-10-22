# -*- coding: utf-8 -*-

import requests
import re
import os
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By

hangle = re.compile(r'[가-힣]')
time_to_sec_regex = re.compile(r'(\d+):(\d+)')

driver = webdriver.PhantomJS()

driver.get('http://video.fc2.com/a/content/20161106kUMZRfKr/')
try:
    element_present = EC.presence_of_element_located((By.CSS_SELECTOR, 'div.video_thumb_small.clsThumbToAlbum'))
    WebDriverWait(driver, 10).until(element_present)
    print("Page is ready!")
except TimeoutException:
    print("Loading took too much time!")

soup = BeautifulSoup(driver.page_source.encode('utf-8'), 'html.parser')

suggests = []
size_menu = soup.find('div', id='wrap_reco')
for li in size_menu.find_all('li', class_='clearfix'):
    url = li.a['href'].split('&')[0].split('?')[0]
    print(url)



