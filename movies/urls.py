from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^search/$', views.search, name='search'),
    url(r'^index/$', views.index, name='index'),
    url(r'^download/$', views.download, name='download'),
    url(r'^watch/$', views.watch, name='watch')
]