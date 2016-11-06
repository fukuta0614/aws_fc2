# -*- encoding:utf-8 -*-

from django.shortcuts import render, redirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponse

from bs4 import BeautifulSoup
import requests
import re
import pickle

from .models import Movie, Tag


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


def home(request):
    page = request.GET.get('page')
    sort_type = request.GET.get('st')

    url = request.get_full_path()

    sort_type = 'playing' if sort_type == 1 else 'fav'
    is_adult = 0 if 'noadult' in url else 1

    movies = Movie.objects.filter(is_adult=is_adult).order_by('-{}'.format(sort_type))
    tags = Tag.objects.filter(is_adult=is_adult).order_by('-num')[:100]

    paginator = Paginator(movies, 60)  # Show 25 contacts per page

    try:
        movies = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        movies = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        movies = paginator.page(paginator.num_pages)

    return render(request, 'movies/home.html', locals())


def search(request):
    page = request.GET.get('page')
    sort_type = request.GET.get('st')
    tag = request.GET.get('tag')
    query = request.GET.get('q')

    url = request.get_full_path()

    sort_type = 'playing' if sort_type == 1 else 'fav'
    is_adult = 0 if 'noadult' in url else 1

    if tag:
        movies = Movie.objects.filter(is_adult=is_adult).filter(tag__contains=tag).order_by('-{}'.format(sort_type))
    elif query:
        movies = Movie.objects.filter(is_adult=is_adult).filter(title__contains=query).order_by('-{}'.format(sort_type))
    else:
        movies = Movie.objects.filter(is_adult=is_adult).order_by('-{}'.format(sort_type))

    tags = Tag.objects.filter(is_adult=is_adult).order_by('-num')[:100]

    paginator = Paginator(movies, 60)  # Show 25 contacts per page

    try:
        movies = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        movies = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        movies = paginator.page(paginator.num_pages)

    return render(request, 'movies/home.html', locals())


def download(request):
    target = request.GET.get('target')
    ginfo_url = Movie.objects.get(id=target).ginfo_url

    headers = {
        'User-Agent': request.META['HTTP_USER_AGENT']
    }
    soup = BeautifulSoup(requests.get(ginfo_url, data=b'None', headers=headers).content, 'html.parser')
    # print(soup.string)
    filepath = str(soup).replace(";", "").split("&amp")
    flv_url = filepath[0].split('=')[1] + '?' + filepath[1]
    # flv_url =  filepath.split('&')[0].split('=')[1] + '?' + filepath.split('&')[1]

    if flv_url.startswith('http'):
        return redirect(flv_url)
    else:
        return redirect('/')
