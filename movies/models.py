from django.db import models
import ast


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
    thumbnail = models.CharField(max_length=120, default='')
    fav = models.IntegerField()
    playing = models.IntegerField()
    is_adult = models.IntegerField(default=1)
    movie_kind = models.CharField(max_length=120, default='')
    tag = models.CharField(max_length=120, default=[])


    def __str__(self):
        return self.title
