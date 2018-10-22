from django.db import models
import ast
import datetime

class Tag(models.Model):
    tag = models.CharField(max_length=120, primary_key=True)
    is_adult = models.IntegerField(default=1)
    num = models.IntegerField()


class Movie(models.Model):
    id = models.CharField(max_length=120, primary_key=True)
    url = models.CharField(max_length=120, default='')
    title = models.CharField(max_length=120, default='')
    ginfo_url = models.CharField(max_length=120, default='')
    play_time = models.CharField(max_length=120, default='')
    play_time_sec = models.IntegerField(default=0)
    thumbnail = models.CharField(max_length=120, default='')
    thumbnail_digest = models.CharField(max_length=120, default='')
    thumbnail_seek = models.CharField(max_length=120, default='')
    sj = models.CharField(max_length=20, default='0')
    fav = models.IntegerField(default=0)
    playing = models.IntegerField(default=1000)
    is_adult = models.IntegerField(default=1)
    removed_check = models.IntegerField(default=10)
    movie_kind = models.CharField(max_length=120, default='')
    tag = models.CharField(max_length=120, default='')
    info = models.CharField(max_length=120, default='')
    # suggests = models.CharField(max_length=512, default='')
    added = models.DateTimeField(auto_now_add=True, auto_now=False)
    updated = models.DateTimeField(auto_now_add=False, auto_now=True)
    uploaded = models.DateTimeField(auto_now_add=False, auto_now=False)

    def __str__(self):
        return self.title
