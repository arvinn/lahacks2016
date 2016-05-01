var queryMsg = {
  origin_place_id: '',
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
      queryMsg.category = $('#cat :selected').val();
      queryMsg.max_detour_time = $('#max :selected').val();

      var url = '/api?origin='+queryMsg.origin_place_id+
                '&destination='+queryMsg.destination_place_id+
                '&category='+queryMsg.category+
                '&max_detour_time='+queryMsg.max_detour_time;
      $.ajax(url,{
        success: function(data){
          console.log(data);

          var json_string = JSON.stringify(data);
          var obj_yelp = jQuery.parseJSON(json_string);

          var template = '{{#places}}<hr><div class="wrapmiddle" style="width:100%;margin-bottom:50px;height:80px">'+
                        '<div class="left col-xs-2"><img src="{{image_url}}"></div>'+
                        '<div class="middle col-xs-6"><a href="{{url}}" id="name" style="font-size:20px">{{name}}</a><p></p><img src="{{rating_img_url_large}}"></div>'+
                        '<div class="right col-xs-4"><p style="font-size:16px">{{#location.neighborhoods}}{{.}}, {{/location.neighborhoods}}</p><p style="font-size:16px">{{location.address}}<br>{{location.city}}, {{location.state_code}} {{location.postal_code}}<br>{{display_phone}}</p></div>'+
                        '</div>{{/places}}';
          var html = Mustache.to_html(template, obj_yelp);
          $('.yelp-content-wrapper').html(html);
        },
        error: function(){
          console.log('An error occrued with ajax');
        }
      });
    }



    // var json_string = JSON.stringify({
    //   "status": "OK",
    //   "places": [
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/pieology-pizzeria-los-angeles-6?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": true,
    //       "rating": 4.0,
    //       "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
    //       "review_count": 76,
    //       "snippet_text": "I can finally have the time to rate this joint! I will give this resto more than 5 stars, their unlimited toppings, and wallet friendly. I love to eat and...",
    //       "phone": "3102080901",
    //       "display_phone": "+1-310-208-0901",
    //       "id": "pieology-pizzeria-los-angeles-6",
    //       "distance": 1178.7929179543391,
    //       "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
    //       "snippet_image_url": "http://s3-media1.fl.yelpcdn.com/photo/21FmxUFMYUH3SKUwlVKN_A/ms.jpg",
    //       "is_closed": false,
    //       "name": "Pieology Pizzeria",
    //       "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/Gwzd5fHvaa9xcHw6M67fqQ/ms.jpg",
    //       "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
    //       "url": "http://www.yelp.com/biz/pieology-pizzeria-los-angeles-6?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "location": {
    //         "address": [
    //           "920 Broxton Ave"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "920 Broxton Ave",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.0629653930664,
    //           "longitude": -118.446746826172
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 8.0
    //       },
    //       "categories": [
    //         [
    //           "Pizza",
    //           "pizza"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/caf%C3%A9-1919-los-angeles-2?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": false,
    //       "rating": 4.0,
    //       "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
    //       "review_count": 28,
    //       "snippet_text": "This place is awesome! There paninis are absolutely amazing. The service is fast and super friendly. It's in such a convenient location. Great sandwhich and...",
    //       "location": {
    //         "address": [
    //           "UCLA",
    //           "350 De Neve Dr"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "UCLA",
    //           "350 De Neve Dr",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.072602559911,
    //           "longitude": -118.45097405577
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 9.5
    //       },
    //       "id": "caf\u00e9-1919-los-angeles-2",
    //       "distance": 549.6646542956269,
    //       "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
    //       "snippet_image_url": "http://s3-media1.fl.yelpcdn.com/photo/mgW2TkzCtUBrjjFFORM2Kw/ms.jpg",
    //       "is_closed": false,
    //       "name": "Caf\u00e9 1919",
    //       "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/F_-DTlaugMoCIWNhib1M8g/ms.jpg",
    //       "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
    //       "url": "http://www.yelp.com/biz/caf%C3%A9-1919-los-angeles-2?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "categories": [
    //         [
    //           "Italian",
    //           "italian"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/seas-cafe-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": true,
    //       "rating": 4.5,
    //       "rating_img_url_large": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/9f83790ff7f6/ico/stars/v1/stars_large_4_half.png",
    //       "review_count": 72,
    //       "snippet_text": "I always come here for my daily low tech/high tech coffee. I definitely appreciate their fairly priced coffee, especially at a college campus, where you'd...",
    //       "phone": "3108254222",
    //       "display_phone": "+1-310-825-4222",
    //       "id": "seas-cafe-los-angeles",
    //       "distance": 549.0314604984997,
    //       "rating_img_url": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png",
    //       "snippet_image_url": "http://s3-media2.fl.yelpcdn.com/photo/LQGNlzTWvnrLSBYaVvYQ6A/ms.jpg",
    //       "is_closed": false,
    //       "name": "SEAS Cafe",
    //       "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/K45NUiAHIuAA58A-3O05ug/ms.jpg",
    //       "rating_img_url_small": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/a5221e66bc70/ico/stars/v1/stars_small_4_half.png",
    //       "url": "http://www.yelp.com/biz/seas-cafe-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "location": {
    //         "address": [
    //           "5800 Boelter Hall"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "5800 Boelter Hall",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.0689838567973,
    //           "longitude": -118.4431814941
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 9.5
    //       },
    //       "categories": [
    //         [
    //           "Cafes",
    //           "cafes"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/il-tramezzino-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": false,
    //       "rating": 4.0,
    //       "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
    //       "review_count": 67,
    //       "snippet_text": "I'm a building manager in Ackerman Union & I constantly get asked by our guests on campus, \"where can I get coffee! Where's the nearest Starbucks?\" Well...",
    //       "phone": "3102068949",
    //       "display_phone": "+1-310-206-8949",
    //       "id": "il-tramezzino-los-angeles",
    //       "distance": 142.74565663725932,
    //       "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
    //       "snippet_image_url": "http://s3-media1.fl.yelpcdn.com/photo/U6pUUO4h4emF24yu1chdug/ms.jpg",
    //       "is_closed": false,
    //       "name": "il Tramezzino",
    //       "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/GJ1DJJZ9BGEkxT4gDcnaTg/ms.jpg",
    //       "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
    //       "url": "http://www.yelp.com/biz/il-tramezzino-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "location": {
    //         "address": [
    //           "110 Westwood Plz",
    //           "Ste F"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "110 Westwood Plz",
    //           "Ste F",
    //           "UCLA",
    //           "Los Angeles, CA 90077"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.0730782,
    //           "longitude": -118.4446182
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90077",
    //         "geo_accuracy": 8.0
    //       },
    //       "categories": [
    //         [
    //           "Cafes",
    //           "cafes"
    //         ],
    //         [
    //           "Italian",
    //           "italian"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/bella-pita-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": true,
    //       "rating": 4.0,
    //       "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
    //       "menu_provider": "eat24",
    //       "review_count": 615,
    //       "snippet_text": "One of my favorite places to get falafel or wowshis! I love the chicken wowshi, lamb wowshi, beef one, and bean pita. The falafel is really crisp and fresh,...",
    //       "phone": "3102091050",
    //       "display_phone": "+1-310-209-1050",
    //       "id": "bella-pita-los-angeles",
    //       "distance": 1241.831199130372,
    //       "menu_date_updated": 1461336260,
    //       "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
    //       "snippet_image_url": "http://s3-media4.fl.yelpcdn.com/photo/S3_z92esbnvT2WDwP-QLhQ/ms.jpg",
    //       "is_closed": false,
    //       "name": "Bella Pita",
    //       "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/YHfitvczRWPBPByENwwckA/ms.jpg",
    //       "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
    //       "url": "http://www.yelp.com/biz/bella-pita-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "location": {
    //         "address": [
    //           "960 Gayley Ave"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "960 Gayley Ave",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.062762,
    //           "longitude": -118.4481571
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 9.5
    //       },
    //       "categories": [
    //         [
    //           "Middle Eastern",
    //           "mideastern"
    //         ],
    //         [
    //           "Sandwiches",
    //           "sandwiches"
    //         ],
    //         [
    //           "Mediterranean",
    //           "mediterranean"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/de-neve-commons-residential-restaurant-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": false,
    //       "rating": 4.0,
    //       "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
    //       "review_count": 40,
    //       "snippet_text": "Had lunch here.  Nothing spectacular for a 5, service was slow for a relatively slow rush for lunch, dropped from 4 to a 3. Basic lunch sandwiches, burgers,...",
    //       "phone": "3102068654",
    //       "display_phone": "+1-310-206-8654",
    //       "id": "de-neve-commons-residential-restaurant-los-angeles",
    //       "distance": 530.0888188158223,
    //       "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
    //       "snippet_image_url": "http://s3-media2.fl.yelpcdn.com/photo/vuoZdULzkrKBULvHTPLvzA/ms.jpg",
    //       "is_closed": false,
    //       "name": "De Neve Commons Residential Restaurant",
    //       "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/JGshjRSncN8tukoHA9cecQ/ms.jpg",
    //       "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
    //       "url": "http://www.yelp.com/biz/de-neve-commons-residential-restaurant-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "location": {
    //         "address": [
    //           "351 Charles E Young Dr"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "351 Charles E Young Dr",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.0729185193777,
    //           "longitude": -118.449496999383
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 8.0
    //       },
    //       "categories": [
    //         [
    //           "Buffets",
    //           "buffets"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/bruin-plate-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": false,
    //       "rating": 4.5,
    //       "rating_img_url_large": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/9f83790ff7f6/ico/stars/v1/stars_large_4_half.png",
    //       "review_count": 27,
    //       "snippet_text": "Holy moly.. Bruin Plate is unlike any other college dining experience. Have you ever heard of a sustainable, organic, local, nutritious and delicious...",
    //       "location": {
    //         "address": [
    //           "350 De Neve Dr"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "350 De Neve Dr",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.0740424,
    //           "longitude": -118.4495862
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 9.5
    //       },
    //       "id": "bruin-plate-los-angeles",
    //       "distance": 411.77710858932113,
    //       "rating_img_url": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png",
    //       "snippet_image_url": "http://s3-media4.fl.yelpcdn.com/photo/OFr-v6T82tuTugwkL5Mnow/ms.jpg",
    //       "is_closed": false,
    //       "name": "Bruin Plate",
    //       "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/e0dv2hFZ2-KnqkJCM4HUog/ms.jpg",
    //       "rating_img_url_small": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/a5221e66bc70/ico/stars/v1/stars_small_4_half.png",
    //       "url": "http://www.yelp.com/biz/bruin-plate-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "categories": [
    //         [
    //           "American (New)",
    //           "newamerican"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/feast-at-rieber-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": false,
    //       "rating": 4.0,
    //       "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
    //       "review_count": 46,
    //       "snippet_text": "Probably one of the best Asian buffets I've been to and for a quick college dining. As a current student who's not living on campus, I wish I did just for...",
    //       "location": {
    //         "address": [
    //           "310 de Neve Dr"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "310 de Neve Dr",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.071675806548,
    //           "longitude": -118.45139353867
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 9.5
    //       },
    //       "id": "feast-at-rieber-los-angeles",
    //       "distance": 616.1966117502146,
    //       "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
    //       "snippet_image_url": "http://s3-media2.fl.yelpcdn.com/photo/LQGNlzTWvnrLSBYaVvYQ6A/ms.jpg",
    //       "is_closed": false,
    //       "name": "Feast At Rieber",
    //       "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/CfXx4-eTCU3PSnxdjIg6sw/ms.jpg",
    //       "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
    //       "url": "http://www.yelp.com/biz/feast-at-rieber-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "categories": [
    //         [
    //           "Asian Fusion",
    //           "asianfusion"
    //         ],
    //         [
    //           "Japanese",
    //           "japanese"
    //         ],
    //         [
    //           "Korean",
    //           "korean"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/dinas-cafe-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": true,
    //       "rating": 4.5,
    //       "rating_img_url_large": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/9f83790ff7f6/ico/stars/v1/stars_large_4_half.png",
    //       "review_count": 14,
    //       "snippet_text": "Definitely a hidden gem in Westwood. They are a relatively new business in town. I go there about once a week because my boyfriend and I have been loving...",
    //       "phone": "3102083535",
    //       "display_phone": "+1-310-208-3535",
    //       "id": "dinas-cafe-los-angeles",
    //       "distance": 1267.69688987002,
    //       "rating_img_url": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png",
    //       "snippet_image_url": "http://s3-media4.fl.yelpcdn.com/photo/vDNJA5U9hUukItv9SBQ2Mg/ms.jpg",
    //       "is_closed": false,
    //       "name": "Dina's Cafe",
    //       "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/zTvvIR1MoQSHFjJF3iPbHw/ms.jpg",
    //       "rating_img_url_small": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/a5221e66bc70/ico/stars/v1/stars_small_4_half.png",
    //       "url": "http://www.yelp.com/biz/dinas-cafe-los-angeles?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "location": {
    //         "address": [
    //           "964 Gayley Ave"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "964 Gayley Ave",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.0625290705628,
    //           "longitude": -118.448187075555
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 9.5
    //       },
    //       "categories": [
    //         [
    //           "Cafes",
    //           "cafes"
    //         ],
    //         [
    //           "Salvadoran",
    //           "salvadoran"
    //         ],
    //         [
    //           "Sandwiches",
    //           "sandwiches"
    //         ]
    //       ]
    //     },
    //     {
    //       "mobile_url": "http://m.yelp.com/biz/in-n-out-burger-los-angeles-5?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "is_claimed": true,
    //       "rating": 4.0,
    //       "rating_img_url_large": "https://s3-media2.fl.yelpcdn.com/assets/2/www/img/ccf2b76faa2c/ico/stars/v1/stars_large_4.png",
    //       "menu_provider": "single_platform",
    //       "review_count": 502,
    //       "snippet_text": "A lot of Californians take In-N-Out for granted.\n\nIt's BY FAR the greatest fast food restaurant. It's also the prime example of quality over quantity. Look...",
    //       "phone": "8007861000",
    //       "display_phone": "+1-800-786-1000",
    //       "id": "in-n-out-burger-los-angeles-5",
    //       "distance": 1202.5118398810419,
    //       "menu_date_updated": 1441962894,
    //       "rating_img_url": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png",
    //       "snippet_image_url": "http://s3-media2.fl.yelpcdn.com/photo/Bx9y2AR1Xw_FmqF1RMjhLQ/ms.jpg",
    //       "is_closed": false,
    //       "name": "In-N-Out Burger",
    //       "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/IxXkaNpJvup6Eb1XbBsYNQ/ms.jpg",
    //       "rating_img_url_small": "https://s3-media4.fl.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png",
    //       "url": "http://www.yelp.com/biz/in-n-out-burger-los-angeles-5?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=0QiihV7dWxCqnf-PgZy8ww",
    //       "location": {
    //         "address": [
    //           "922 Gayley Ave"
    //         ],
    //         "country_code": "US",
    //         "city": "Los Angeles",
    //         "display_address": [
    //           "922 Gayley Ave",
    //           "UCLA",
    //           "Los Angeles, CA 90024"
    //         ],
    //         "coordinate": {
    //           "latitude": 34.0630912780762,
    //           "longitude": -118.447998046875
    //         },
    //         "state_code": "CA",
    //         "neighborhoods": [
    //           "UCLA",
    //           "Westwood"
    //         ],
    //         "postal_code": "90024",
    //         "geo_accuracy": 8.0
    //       },
    //       "categories": [
    //         [
    //           "Fast Food",
    //           "hotdogs"
    //         ],
    //         [
    //           "Burgers",
    //           "burgers"
    //         ]
    //       ]
    //     }
    //   ]
    // })
    // var obj_yelp = jQuery.parseJSON(json_string);

    // var template = '{{#places}}<hr><div class="wrapmiddle" style="width:100%;margin-bottom:50px;height:80px">'+
    //               '<div class="left col-xs-2"><img src="{{image_url}}"></div>'+
    //               '<div class="middle col-xs-6"><a href="{{url}}" id="name" style="font-size:20px">{{name}}</a><p></p><img src="{{rating_img_url_large}}"></div>'+
    //               '<div class="right col-xs-4"><p style="font-size:16px">{{#location.neighborhoods}}{{.}}, {{/location.neighborhoods}}</p><p style="font-size:16px">{{location.address}}<br>{{location.city}}, {{location.state_code}} {{location.postal_code}}<br>{{display_phone}}</p></div>'+
    //               '</div>{{/places}}';
    // var html = Mustache.to_html(template, obj_yelp);
    // $('.yelp-content-wrapper').html(html);

  });
});