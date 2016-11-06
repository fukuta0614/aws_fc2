from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'$', views.home, name='home_na'),
    url(r'^search$', views.search, name='search_na'),
    url(r'^index$', views.index, name='index'),
    url(r'^download&', views.download, name='download')
]