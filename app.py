#!/bin/env python
# coding: utf-8

import os
from flask import Flask, render_template
import sqlite3

app = Flask(__name__)
app.debug = True

cur_dir = os.path.dirname(__file__)
dbpath = os.path.join(cur_dir, 'db.sqlite3')


def sqlite_entry():
    conn = sqlite3.connect(dbpath)
    c = conn.cursor()
    c.execute("select * from movies_movie")
    x = " | ".join([str(x) for x in c.fetchone()])
    conn.close()
    return x


@app.route('/')
def index():
    return sqlite_entry()


@app.route('/hello/<name>')
def hello(name=''):
    if name == '':
        name = 'ななしさん'
    return render_template('hello.html', name=name)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(port=port)
