var osmtogeojson = require('osmtogeojson');
var util = require('util');
var async = require('async');
L.mapbox.accessToken = 'pk.eyJ1IjoiZ2VvaGFja2VyIiwiYSI6ImFIN0hENW8ifQ.GGpH9gLyEg0PZf3NPQ7Vrg';
var map = L.mapbox.map('map', 'mapbox.streets');

var osmData = {
    'type': "FeatureCollection",
    'features': []
};

var formData = {};

var head = '[out:json];'
var q = head+"node(user:'%s')%s%s(%s);out;";

function queryOverpass (u, callback) {
    var bbox = map.getBounds().toBBoxString().split(',');
    var overpassBbox = bbox[1]+','+bbox[0]+','+bbox[3]+','+bbox[2];
    var overpassDate = '';
    var overpassFilter = '';
    if (formData.fromDate != '' && formData.toDate != '') {
        overpassDate = "(changed:'"+formData.fromDate+"','"+formData.toDate+"')"
    } else if (formData.fromDate != '' && formData.toDate === '') {
        overpassDate = "(changed:'"+formData.fromDate+"')";
    }
    if (formData.tags.length && formData.tags[0] != '') {
        formData.tags.forEach(function (tag) {
            var key = tag.split('=')[0];
            var value = tag.split('=')[1];
            console.log(value);
            if (value === undefined) {
                console.log('here')
                overpassFilter = overpassFilter+"['"+key+"']";
            } else {
                overpassFilter = overpassFilter+"['"+key+"'="+"'"+value+"']";
            }
        });
    }
    var query = util.format(q, u, overpassDate, overpassFilter, overpassBbox);
    $('.loading').css('display', 'inline-block');
    var url = 'http://overpass.osm.rambler.ru/cgi/interpreter?data='+query;
    $.ajax(url)
        .done(function(data) {
            console.log(data);
            var geojson = osmtogeojson(data);
            callback(null, geojson);
        });
}

function errorNotice (message) {
    $('.note').css('display', 'block');
    $('.note p').text(message);
    window.setTimeout(function() {
        $('.note').css('display', 'none');
    }, 2000);

}

$('.button').on('click', function() {
    formData = {
        'users': $('#usernames').val().split(','),
        'tags': $('#tags').val().split(','),
        'fromDate': $('#fromdate').val() ? new Date($('#fromdate').val()).toISOString() : '',
        'toDate': $('#todate').val() ? new Date($('#todate').val()).toISOString() : ''
    };



    if (formData.users.length && formData.users[0] == '') {
        errorNotice('Specify at least one username');
        return;
    };

    async.map(formData.users, queryOverpass, function (err, results) {
        Array.prototype.push.apply(osmData.features, results[0].features);
        console.log('all results in', osmData);
        var json = JSON.stringify(osmData);
    
        var blob = new Blob([json], {type: "application/json"});
        var url = URL.createObjectURL(blob);

        $('#download').css('display', 'inline-block');
        $('#download').attr('href', url);

        $('.loading').css('display', 'none');
        $('.count').css('display', 'block');
        var nodes = document.getElementById('nodes');
var ways = document.getElementById('ways');

          //var count = document.createElement('div');
          //count.setAttribute('class','col6');
        
          nodes.innerHTML =  osmData.features.length;
           ways.innerHTML ;
       
    });
    console.log(formData);
});
