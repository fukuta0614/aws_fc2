# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-06 10:32
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0006_movie_sj'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='uploaded',
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
