import json
import requests
import rauth
from django.shortcuts import render
from config import secret_keys
from yelp.client import Client
from yelp.oauth1_authenticator import Oauth1Authenticator
from math import radians, cos, sin, asin, sqrt

def get_line_equation(origin, destination):
    x_delta = (origin[0] - destination[0])
    y_delta = (origin[1] - destination[1])
    
    if x_delta == 0:
        return None
    else:
        m = y_delta/x_delta

    # y = mx + b
    b = origin[1] - m*origin[0]

    def line_equation(x):
        return m*x + b

    return line_equation

def get_n_points_in_between(n, origin, destination):
    eqn = get_line_equation(origin, destination)

    if eqn is None:
        y_delta = abs(destination[1] - origin[1]) / (n+1)
        return [(origin[0], origin[1] + y_delta*i) for i in range(1, n+1)]

    x_delta = abs(destination[0] - origin[0]) / (n+1)
    points = []

    for i in range(1, n+1):
        x = origin[0] + x_delta*i
        y = eqn(x)
        points.append((x,y))

    return points







def distance(origin, destination):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    http://stackoverflow.com/questions/15736995/how-can-i-quickly-estimate-the-distance-between-two-latitude-longitude-points
    """

    lat1, lon1 = origin
    lat2, lon2 = destination

    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    km = 6367 * c
    miles = km / 1.60934
    return miles


# YELP
yelp_auth = Oauth1Authenticator(
    consumer_key=secret_keys.YELP_CONSUMER_KEY,
    consumer_secret=secret_keys.YELP_CONSUMER_SECRET,
    token=secret_keys.YELP_TOKEN,
    token_secret=secret_keys.YELP_TOKEN_SECRET
)
yelp_client = Client(yelp_auth)


def google_search(start_lat, start_lng, end_lat, end_lng):
    url_template = "https://maps.googleapis.com/maps/api/directions/json?origin={},{}&destination={},{}&key={}"
    url = url_template.format(start_lat, start_lng, end_lat, end_lng, secret_keys.SERVER_GOOGLE_MAP_KEY)

    directions = requests.get(url)
    return directions.json()



def yelp_search(lat,lng):
  params = {
    #"term": "restaurant",
    "category_filter": "restaurants",
    "ll": "{},{}".format(lat, lng),
    "radius_filter": "1600", #in meters
    "limit": "10",
    "sort": "2",   # highest rated: https://www.yelp.com/developers/documentation/v2/search_api
  }

  session = rauth.OAuth1Session(
     consumer_key = secret_keys.YELP_CONSUMER_KEY,
     consumer_secret = secret_keys.YELP_CONSUMER_SECRET,
     access_token = secret_keys.YELP_TOKEN,
     access_token_secret = secret_keys.YELP_TOKEN_SECRET)
     
  request = session.get("http://api.yelp.com/v2/search",params=params)
   
  #Transforms the JSON API response into a Python dictionary
  data = request.json()

  session.close()
  return data

def index(request):

    context = {}
    return render(request, 'map/index.html', context)

def api(request):

    #x = get_n_points_in_between(9, (0,0), (10, 10))

    ucla = [34.073647, -118.445141]
    hollywood = [34.090304, -118.392343]
    lasvegas = [36.181140, -115.132808]

    directions = google_search(ucla[0], ucla[1], hollywood[0], hollywood[1])

    num_miles = distance(ucla, hollywood)
    centers = get_n_points_in_between(int(num_miles), ucla, hollywood)


    results = {}
    for center in centers:
        businesses = yelp_search(ucla[0], ucla[1])['businesses']
        for biz in businesses:
            results[biz['id']] = biz

    results = results


    context = {'yelp': json.dumps(results, indent=4),
               'google': json.dumps(directions, indent=4)
               }

    return render(request, 'map/api.html', context)
