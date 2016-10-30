import requests
from bs4 import BeautifulSoup


headers = {
    'user-agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
}
login_data = {
    'email': '',
    'pass': '',
}
session = requests.session()
soup = BeautifulSoup(session.post('https://secure.id.fc2.com/index.php?mode=login&switch_language=en', data=login_data, headers=headers).content)

for p in range(10):
    soup = BeautifulSoup(session.get('http://video.fc2.com/a/recentpopular.php?page={}'.format(p), timeout=5).content, "html.parser")

    for movie in soup.find('div', id='video_list_1column').find_all('div', class_="video_list_renew clearfix"):
        url = movie.find('div', class_='video_info_right').h3.a['href'].split('&')[0].split('?')[0]

        soup = BeautifulSoup(session.get(url).content, "html.parser")

        print(','.join([li.a.span.text for li in soup.find_all('li', class_='radius_all tag_lock')]))
        print(int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[0].strong.text))
        print(int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[1].strong.text))

# url='http://video.fc2.com/a/content/201312272rvZR6mS/'
# soup = BeautifulSoup(session.get(url).content, 'html.parser')
# print(','.join([li.a.span.text for li in soup.find_all('li', class_='radius_all tag_lock')]))
# print(int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[0].strong.text))
# print(int(soup.find('ul', class_='cont_v2_info_movie01').find_all('li')[1].strong.text))
# with open('fc2.html', 'w') as f:
#     f.write(str(soup))
