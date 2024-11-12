from flask import Flask, render_template, request, redirect, url_for, jsonify
import requests
import io
import sys
from pygments.lexers import PythonLexer
from pygments.token import Token
import networkx as nx
import webbrowser
from threading import Timer

app = Flask(__name__)

STACK_OVERFLOW_API_URL = "https://api.stackexchange.com/2.2/search?order=desc&sort=activity&site=stackoverflow"