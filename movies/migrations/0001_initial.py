# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-10-29 09:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Movie',
            fields=[
                ('id', models.CharField(max_length=120, primary_key=True, serialize=False)),
                ('url', models.CharField(default='', max_length=120)),
                ('title', models.CharField(default='', max_length=120)),
                ('link', models.CharField(default='', max_length=120)),
                ('ginfo_url', models.CharField(default='', max_length=120)),
                ('play_time', models.CharField(default='', max_length=120)),
                ('thumbnail', models.CharField(default='', max_length=120)),
                ('fav', models.IntegerField()),
                ('playing', models.IntegerField()),
                ('is_adult', models.IntegerField(default=1)),
                ('tag', models.CharField(default=[], max_length=120)),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('tag', models.CharField(max_length=120, primary_key=True, serialize=False)),
                ('is_adult', models.IntegerField(default=1)),
                ('num', models.IntegerField()),
            ],
        ),
    ]
