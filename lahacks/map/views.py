import json
import requests
import rauth
from django.shortcuts import render
from django.http import JsonResponse
from config import secret_keys
from yelp.client import Client
from yelp.oauth1_authenticator import Oauth1Authenticator
from math import radians, cos, sin, asin, sqrt
from django.views.decorators.csrf import csrf_exempt



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



def google_direction_search_no_waypoints(origin_placeid, dest_placeid):
    url_template = "https://maps.googleapis.com/maps/api/directions/json?origin=place_id:{}&destination=place_id:{}&key={}"
    url = url_template.format(origin_placeid, dest_placeid, secret_keys.SERVER_GOOGLE_MAP_KEY)

    directions = requests.get(url)
    return directions.json()

def google_direction_search(start_placeid, end_placeid, waypoint_lat, waypoint_lng):
    url_template = "https://maps.googleapis.com/maps/api/directions/json?origin=place_id:{}&destination=place_id:{}&waypoints={},{}&key={}"
    url = url_template.format(start_placeid, end_placeid, waypoint_lat, waypoint_lng, secret_keys.SERVER_GOOGLE_MAP_KEY)

    directions = requests.get(url)
    return directions.json()



def yelp_search(lat,lng, category=None):
  if category is None:
    category = "restaurants"

  params = {
    #"term": "restaurant",
    "category_filter": category,
    "ll": "{},{}".format(lat, lng),
    "radius_filter": "1600", #in meters
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

# TODO: fix csrf
@csrf_exempt
def api(request):


    ucla_id = 'ChIJZQ9c8IW8woARN0gTXFiTqSU'
    hollywood_id = 'ChIJ4zPwIdm-woARpyaKDi1M5FA'
    ucla = [34.073647, -118.445141]
    hollywood = [34.090304, -118.392343]
    usc = [34.072468, -118.360652]
    lasvegas = [36.181140, -115.132808]



    origin = request.GET.get("origin", ucla_id)
    destination = request.GET.get("destination", hollywood_id)
    category = request.GET.get("category", "restaurants")
    max_detour_time = int(request.GET.get("max_detour_time", 10))


    num_miles = distance(ucla, hollywood)

    if num_miles > 10:
        return JsonResponse({'status': 'ERROR: distance limit exceeded', 'places':[]},
                json_dumps_params={'indent':'  '})


    centers = get_n_points_in_between(int(num_miles), ucla, hollywood)


    results = {}
    for center in centers:
        businesses = yelp_search(ucla[0], ucla[1], category)['businesses']
        for biz in businesses:
            results[biz['id']] = biz

    places = list(map(lambda x: x[1], results.items()))

    original_directions = google_direction_search_no_waypoints(origin, destination)
    route = original_directions['routes']
    route = route[0]
    legs = route['legs']
    og_duration = 0
    for leg in legs:
        for step in leg['steps']:
            d_step = step['duration']['text']
            (n, mins) = d_step.split()
            og_duration += int(n)


    for place in places:
        lat = place['location']['coordinate']['latitude']
        lng = place['location']['coordinate']['longitude']

        directions = google_direction_search(origin, destination, lat, lng)
        route = directions['routes'][0]
        legs = route['legs']
        duration = 0
        for leg in legs:
            #d = leg['duration']['text']
            #(n, mins) = d.split()
            #duration += int(n)

            for step in leg['steps']:
                d_step = step['duration']['text']
                (n, mins) = d_step.split()
                duration += int(n)

        place['duration'] = duration - og_duration


       # print("=================")
       # print(duration)
       # print(place['name'])
       #print(json.dumps(directions, indent=2))

    places = list(filter(lambda x: x['duration'] < 5, places))




    response = {
        "status": "OK",
        "count": len(places),
        "places": places
    }


    #context = {'yelp': json.dumps(response, indent=4),
    #           'google': json.dumps(directions, indent=4)
    #           }
    #return render(request, 'map/api.html', context)

    print("=======")
    return JsonResponse(response,  json_dumps_params={'indent':'  '})
