var query_overpass = require('query-overpass');
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
var q = head+"node(user:'%s')(changed:'%s')(%s);out;";

function queryOverpass (u, callback) {
    var bbox = map.getBounds().toBBoxString().split(',');
    var overpassBbox = bbox[1]+','+bbox[0]+','+bbox[3]+','+bbox[2];
    var overpassDate = formData.fromDate+','+formData.toDate;
    console.log(util.format(q, u, overpassDate, overpassBbox));
    query_overpass(util.format(q, u, overpassDate, overpassBbox), function (err, data) {
        Array.prototype.push.apply(osmData.features, data.features);
        callback(null, u);
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
        'fromDate': new Date($('#fromdate').val()).toISOString(),
        'toDate': new Date($('#todate').val()).toISOString()
    };

    if (formData.users.length && formData.users[0] == '') {
        errorNotice('Specify at least one username');
        return;
    };

    async.map(formData.users, queryOverpass, function (err, results) {
        // offer to download
        console.log('all results in', osmData);
        var json = JSON.stringify(osmData);
        var blob = new Blob([json], {type: "application/json"});
        var url = URL.createObjectURL(blob);
        // console.log(url);
        $('#download').css('display', 'inline-block');
        $('#download').attr('href', url);
        // L.geoJson(osmData).addTo(map);
    });
    console.log(formData);
});
