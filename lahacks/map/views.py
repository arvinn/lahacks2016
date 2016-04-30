from django.shortcuts import render
from config import secret_keys

# Create your views here.


def index(request):
    context = {}
    return render(request, 'map/index.html', context)
