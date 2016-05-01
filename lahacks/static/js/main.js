var queryMsg = {
  origin_place_id: 'aaaa',
  destination_place_id: '',
  category: '',
  max_detour_time: ''
};

function initMap() {
  var origin_place_id = null;
  var destination_place_id = null;
  var travel_mode = google.maps.TravelMode.WALKING;
  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    center: {lat: 34.0689254, lng: -118.4473698},
    zoom: 13
  });
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  directionsDisplay.setMap(map);

  var origin_input = document.getElementById('origin-input');
  var destination_input = document.getElementById('destination-input');
  var modes = document.getElementById('mode-selector');

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(destination_input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

  var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
  origin_autocomplete.bindTo('bounds', map);
  var destination_autocomplete =
      new google.maps.places.Autocomplete(destination_input);
  destination_autocomplete.bindTo('bounds', map);

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function setupClickListener(id, mode) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      travel_mode = mode;
    });
  }
  setupClickListener('changemode-walking', google.maps.TravelMode.WALKING);
  setupClickListener('changemode-transit', google.maps.TravelMode.TRANSIT);
  setupClickListener('changemode-driving', google.maps.TravelMode.DRIVING);

  function expandViewportToFitPlace(map, place) {
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  }

  origin_autocomplete.addListener('place_changed', function() {
    var place = origin_autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }
    expandViewportToFitPlace(map, place);

    // If the place has a geometry, store its place ID and route if we have
    // the other place ID
    origin_place_id = place.place_id;
    queryMsg.origin_place_id = origin_place_id;
    route(origin_place_id, destination_place_id, travel_mode,
          directionsService, directionsDisplay);
  });

  destination_autocomplete.addListener('place_changed', function() {
    var place = destination_autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }
    expandViewportToFitPlace(map, place);

    // If the place has a geometry, store its place ID and route if we have
    // the other place ID
    destination_place_id = place.place_id;
    queryMsg.destination_place_id = destination_place_id;
    route(origin_place_id, destination_place_id, travel_mode,
          directionsService, directionsDisplay);

  });

  function route(origin_place_id, destination_place_id, travel_mode,
                 directionsService, directionsDisplay) {
    if (!origin_place_id || !destination_place_id) {
      return;
    }
    directionsService.route({
      origin: {'placeId': origin_place_id},
      destination: {'placeId': destination_place_id},
      travelMode: travel_mode
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }
}


$(document).ready(function(){ 
  $('#sub').click(function(){ 
    var flag = 0;

    // $('.yelp-content-wrapper').html() = '';
    if($('#cat :selected').text() == "Select A Category..."){
      flag = 1;
      $('.error-cat p').css("visibility", "visible");
    }
    if($('#max :selected').text() == "Select A Maximum Detour Time..."){
      flag = 1;
      $('.error-max p').css("visibility", "visible");
    }  
    if(flag == 0){
      $('.error-cat p').css("visibility", "hidden");
      $('.error-max p').css("visibility", "hidden");
      queryMsg.category = $('#cat :selected').text();
      queryMsg.max_detour_time = $('#max :selected').text();
    }


    var json_string = JSON.stringify({
      "mobile_url": "http://m.yelp.com/biz/pieology-pizzeria-los-angeles-6?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
      "is_claimed": true,
      "rating": 4.0,
      "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
      "review_count": 76,
      "snippet_text": "I can finally have the time to rate this joint! I will give this resto more than 5 stars, their unlimited toppings, and wallet friendly. I love to eat and...",
      "phone": "3102080901",
      "display_phone": "+1-310-208-0901",
      "id": "pieology-pizzeria-los-angeles-6",
      "distance": 1178.7929179543391,
      "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
      "snippet_image_url": "http://s3-media1.fl.yelpcdn.com/photo/21FmxUFMYUH3SKUwlVKN_A/ms.jpg",
      "is_closed": false,
      "name": "Pieology Pizzeria",
      "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/Gwzd5fHvaa9xcHw6M67fqQ/ms.jpg",
      "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
      "url": "http://www.yelp.com/biz/pieology-pizzeria-los-angeles-6?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
      "location": {
        "address": [
          "920 Broxton Ave"
        ],
        "country_code": "US",
        "city": "Los Angeles",
        "display_address": [
          "920 Broxton Ave",
          "UCLA",
          "Los Angeles, CA 90024"
        ],
        "coordinate": {
          "latitude": 34.0629653930664,
          "longitude": -118.446746826172
        },
        "state_code": "CA",
        "neighborhoods": [
          "UCLA",
          "Westwood"
        ],
        "postal_code": "90024",
        "geo_accuracy": 8.0
      },
      "categories": [
        [
          "Pizza",
          "pizza"
        ]
      ]
    })
    var obj_yelp = jQuery.parseJSON(json_string);
    // $('.container').after('<hr>');
    // $('.container').after('<div class="yelp-content-wrapper"></div>');
    // $('.yelp-content-wrapper').css({"margin":"auto","width":"50%"});

    var template = '<hr><div class="wrapmiddle" style="margin-bottom:50px">'+
                  '<div class="left col-xs-2"><img src="{{image_url}}"></div>'+
                  '<div class="middle col-xs-6"><a href="{{url}}" id="name" style="font-size:20px">{{name}}</a><p></p><img src="{{rating_img_url_large}}"></div>'+
                  '<div class="right col-xs-4"><p style="font-size:16px">{{#location.neighborhoods}}{{.}}, {{/location.neighborhoods}}</p><p style="font-size:16px">{{location.address}}<br>{{location.city}}, {{location.state_code}} {{location.postal_code}}<br>{{display_phone}}</p>'+
                  '</div><hr>';
    $('.wrapmiddle .middle #name').css({"font-size":"30px"});
    var html = Mustache.to_html(template, obj_yelp);
    $('.yelp-content-wrapper').html(html);


    

   








  });
});

