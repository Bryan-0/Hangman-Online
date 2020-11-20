from flask import Flask, render_template, Response, request, redirect, url_for, send_from_directory, session, g
from flask_socketio import SocketIO, send, emit
from flask_sslify import SSLify
from datetime import datetime

app = Flask(__name__, static_url_path='/templates', static_folder='static')
#sslify = SSLify(app, subdomains=True)
app.config['SECRET_KEY'] = b'\xe5\xc4^(\xc9\n\xce\x9a|f\xe0\xf2\xd5\xc8\xf1\x05'
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = 'files'
socketio = SocketIO(app)

from app import views