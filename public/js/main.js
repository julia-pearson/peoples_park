// What should be in controllers?
// Is it OK to split into two pages?
// Should I be using angular or ajax?
// How to I get my additions to load into the database?
// Need to take down this marker.

var map;
var carImage = "/images/car-available.png";
var userAdding = false;

// var canDrag = false;

// reusable marker maker
var addMarker = function(location){
  location.location.lat = parseFloat(location.location.lat);
  location.location.lng = parseFloat(location.location.lng);
  console.log(location.location, location.location);

  // logic that sets car marker
  if(location.status == 'current'){
    carImage = '/images/car-available.png';
  }else if(location.status == 'soon'){
    carImage = '/images/car-soon.png';
  }else if(location.status == 'taken'){
    carImage = '/images/my-car.png';
  };

  var contentStringStart = '<div id="content">'+'<div id="siteNotice">'+'</div>'+'<h1 id="firstHeading" class="firstHeading">'+ location.day +'</h1>'+'<div id="bodyContent">'; 
  var middle;

  // logic that sets info timing
  if(location.status == 'soon'){
    middle = '<p>Leaving Spot at ' + location.leaving;
  }else if(location.status == 'current' || location.status == 'expiring'){
    middle = '<p>Left Spot at ' + location.leaving;
  }else if(location.status == 'taken'){
    middle = '<p>Get to Spot by ' + location.leaving;
  };

  var contentStringEnd = '</p>'+'<a id="take-spot" href="/false">'+'Take Spot</a>'+'</div>'+'</div>';
  var contentString = contentStringStart+middle+contentStringEnd;
  //make action for taking spot away
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  // console.log(location._id);
  var marker = new google.maps.Marker({
    // set the positon to the latitude and longitude
    position: location.location,
    // the map I defined
    map: map,
    id: location._id,
    // draggable: canDrag,
    // makes icon my car image
    icon: carImage
  });
  marker.addListener('click', function(event) {
    infowindow.open(map, marker);
    $('#take-spot').on('click', function(event){
      //stop link in info box from workign
      event.preventDefault();
      $.ajax({
        url: '/taken',
        type: 'POST',
        dataType: 'json',
        data: {spot: location}
      }).done(function(response){console.log(response);});
    });
  });
};
// puts all locations on the map
var addAllMarkers = function(markers){
  markers.forEach(addMarker);
} 
//make map with markers
function initMap() {
  // makes map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: +40.6706031, lng: -73.9901245},
    zoom: 15
  });
};

$(document).ready(function(){
  var $modal = $(".modal-container");
  $modal.toggle();
  $('#see-spots').on('click',function(event){
    $modal.toggle();
    // Gets all seeded locations
    $.ajax({
      url: '/spots',
      type: 'GET',
      dataType: 'json'
    }).done(addAllMarkers);
  })
  $('#add-spot').on('click',function(event){
    userAdding = true;
    $modal.toggle();
    // canDrag = true;
    //to add spot onto the map
    map.addListener('click', function(event) {
      //get latitude and longitude from click
      var latitude = event.latLng.lat();
      var longitude = event.latLng.lng();  

      var thisTime = new Date();

      //grab the form modal and show it
      var $formModal = $('.form-modal-container');
      $formModal.toggle();

      $('#new-spot-button').on('click',function(event){
        event.preventDefault();
        var thisDay = $('#day-input').val();
        // will either be now or 5-20 minutes
        var thisStatus = $('#status-input').val(); 
        // console.log(thisStatus);
        var thisTime = new Date();
        if(thisStatus == 'now'){
          thisStatus = "current";
        } else {
          var minuteDelay = thisTime.getMinutes()+parseInt(thisStatus);
          thisTime.setMinutes(minuteDelay); 
          thisStatus = "soon";
        }
        //prevent submit button
        var pickedLocation = {location: {lat: latitude, lng: longitude}, leaving: thisTime, day: thisDay, status: thisStatus};
        $formModal.toggle();
        $.ajax({
          url: '/spots',
          type: 'POST',
          dataType: 'json',
          data: {spot: pickedLocation}
        }).done(addMarker(pickedLocation));
      });
    });
  })
});