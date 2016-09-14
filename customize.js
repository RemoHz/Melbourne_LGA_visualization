
var mapboxAccessToken = 'sk.eyJ1IjoicmVtb2NvZGUiLCJhIjoiY2l0MWJxeHVvMHBtOTJ5cGdyZmZpNWJkMSJ9.2eNgaP8442q_ZdWNXH5UkQ';

//var map = L.map('map').setView([37.8, -96], 4);
var map = L.map( 'map', {
    center: [-37.8, 145.0],
    minZoom: 2,
    zoom: 11,
    zoomControl: false
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Victoria Local Government Areas (LGA) Profile</h4>' +  (props ?
        '<b>' + props.lga + '</b>'
            + '<br />Popular Town: ' + props.pop_town
            + '<br />Crime Rank: ' + props.crime_rank
            + '<br />Safety Rank: ' + props.safe_rank
            + '<br />House Price Rank: ' + props.house_price_rank
            + '<br />Median House Price: $' + props.house_price
        : 'Hover over a LGA');
};

info.addTo(map);


// get color depending on crime value
function getColor(d) {
    return d > 180 ? '#800026' :
           d > 150 ? '#BD0026' :
           d > 120 ? '#E31A1C' :
           d > 90  ? '#FC4E2A' :
           d > 60  ? '#FD8D3C' :
           d > 30  ? '#FEB24C' :
           d > 0   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.crime)
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

//map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 30, 60, 90, 120, 150, 180, 210],
        labels = [],
        from, to;

    labels.push('Crime cases / 1K');

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

var lc = L.control.locate({
    position: 'topleft',
    strings: {
        title: "Show me where I am, yo!"
    }
}).addTo(map);
