$(document).ready(function() {

	var projects;
    
    var data = us_states;
    
    var grayscale   = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {id: 'mapbox.dark', attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'}),
    streets  = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {id: 'mapbox.streets',  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'}),
    light  = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {id: 'mapbox.streets',  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'});


    var map = L.map('map', {
			center: [29.9510, -90.0715],
			zoom: 5,
			minZoom: 4
		});
    
    var baseLayers = {
		"Light": light,
        "Dark": grayscale,
		"Streets": streets
	};
    

	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        accessToken:'pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA'
    }).addTo(map);
    
    L.control.layers(baseLayers).addTo(map);

	$.getJSON("data/dwh.geojson")
		.done(function(data) {

			var info = processData(data);
			createPropSymbols(info.timestamps, data);
			createLegend(info.min,info.max);
			createSliderUI(info.timestamps);

		})
		.fail(function() { alert("There has been a problem loading the data.")});
    
    
   var featuresLayer = new L.GeoJSON(data, {
			style: function(feature) {
				return {color: feature.properties.color };
			},
			onEachFeature: function(feature, marker) {
				marker.bindPopup('<h4 style="color:#537898">'+ feature.properties.name +'</h4>');
			}
		});

	map.addLayer(featuresLayer);

	var searchControl = new L.Control.Search({
		layer: featuresLayer,
		propertyName: 'name',
		marker: false,
		moveToLocation: function(latlng, title, map) {
			//map.fitBounds( latlng.layer.getBounds() );
			var zoom = map.getBoundsZoom(latlng.layer.getBounds());
  			map.setView(latlng, zoom); // access the zoom
		}
	});

	searchControl.on('search:locationfound', function(e) {
		
		//console.log('search:locationfound', );

		//map.removeLayer(this._markerSearch)

		e.layer.setStyle({fillColor: '#537898', color: 'yellow'});
		if(e.layer._popup)
			e.layer.openPopup();

	}).on('search:collapsed', function(e) {

		featuresLayer.eachLayer(function(layer) {	//restore feature color
			featuresLayer.resetStyle(layer);
		});	
	});
	
	map.addControl( searchControl );  //inizialize search control

    

	function processData(data) {

		var timestamps = [];
		var	min = Infinity;
		var	max = -Infinity;

		for (var feature in data.features) {

			var properties = data.features[feature].properties;

			for (var attribute in properties) {

				if ( attribute != 'PRJ_ID' &&
					 attribute != 'PRJ_NAME' &&
					 attribute != 'ST_PROV' &&
					 attribute != 'PRJ_ACTPRIME'&&
                     attribute != 'Tot_DWH_Fund_Cont'&&
                     attribute != 'longitude'&&
                     attribute != 'latitude'
                   )
				{
					if ( $.inArray(attribute,timestamps) ===  -1) {
						timestamps.push(attribute);
					}
					if (properties[attribute] < min) {
						min = properties[attribute];
					}
					if (properties[attribute] > max) {
						max = properties[attribute];
					}
				}
			}
		}
		return {
			timestamps : timestamps,
			min : min,
			max : max
		}
    
	}  // end processData()
    
    function searchData(data) {
        
        var name = [];
        
        for (var feature in data.features) {

			var properties = data.features[feature].properties;

			for (var attribute in properties) {

				if ( attribute == 'PRJ_NAME' )
                    
                {
					if ( $.inArray(attribute,name) ===  -1) {
						state.push(attribute);
					}
				}
            }
        }
        return {
			name : name
        
		}
         
    } 

        
	function createPropSymbols(timestamps, data) {

		projects = L.geoJson(data, {

			pointToLayer: function(feature, latlng) {

				return L.circleMarker(latlng, {

				    fillColor: "#2B5159",
                    color: "#537898",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6

				}).on({

					mouseover: function(e) {
						this.openPopup();
						this.setStyle({color: 'yellow'});
					},
					mouseout: function(e) {
						this.closePopup();
						this.setStyle({color: '#537898'});

					}
				});
			}
		}).addTo(map);

		updatePropSymbols(timestamps[0]);

	} // end createPropSymbols()
      
	function updatePropSymbols(timestamp) {

		projects.eachLayer(function(layer) {

			var props = layer.feature.properties;
			var	radius = calcPropRadius(props[timestamp]);
			var	popupContent = "<i><b>Project: </b>" + props.PRJ_NAME +
							   "</i><br>"+"<i><b>Year: </b>" + timestamp + "</i><br>"+"<i><b>Funding Amount: </b><b> $" + parseFloat(Math.round(props[timestamp]/1000000)) + " million</i></b>";

			layer.setRadius(radius);
			layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });

		});
	} // end updatePropSymbols
	function calcPropRadius(attributeValue) {

		var scaleFactor = .00005,
			area = attributeValue * scaleFactor;

		return Math.sqrt(area/Math.PI);

	} // end calcPropRadius
	function createLegend(min, max) {

		if (min < 10) {
			min = 10;
		}

		function roundNumber(inNumber) {

       		return (Math.round(inNumber/100) * 10);
		}

		var legend = L.control( { position: 'bottomright' } );

		legend.onAdd = function(map) {

			var legendContainer = L.DomUtil.create("div", "legend");
			var	symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
			var	classes = [Math.round((max-min)/15),Math.round((max-min)/5),Math.round((max-min)/3),Math.round((max-min)/1.5), Math.round(max)];
			var	legendCircle;
			var	lastRadius = 0;
			var  currentRadius;
			var  margin;

			L.DomEvent.addListener(legendContainer, 'mousedown', function(e) {
				L.DomEvent.stopPropagation(e);
			});

			$(legendContainer).append("<h2 id='legendTitle'>Project Funding Amount</h2>");

			for (var i = 0; i <= classes.length-1; i++) {

				legendCircle = L.DomUtil.create("div", "legendCircle");

				currentRadius = calcPropRadius(classes[i]);

				margin = -currentRadius - lastRadius - 2;

				$(legendCircle).attr("style", "width: " + currentRadius*2 +
					"px; height: " + currentRadius*2 +
					"px; margin-left: " + margin + "px" );

				$(legendCircle).append("<span class='legendValue'>$"+parseFloat(Math.round(classes[i]/1000000))+" m<span>");

				$(symbolsContainer).append(legendCircle);

				lastRadius = currentRadius;

			}

			$(legendContainer).append(symbolsContainer);

			return legendContainer;

		};

		legend.addTo(map);
	} // end createLegend()
	function createSliderUI(timestamps) {

		var sliderControl = L.control({ position: 'bottomleft'} );

		sliderControl.onAdd = function(map) {

			var slider = L.DomUtil.create("input", "range-slider");

			L.DomEvent.addListener(slider, 'mousedown', function(e) {

				L.DomEvent.stopPropagation(e);

			});

			$(slider)
				.attr({'type':'range', 'max': timestamps[timestamps.length-1], 'min':timestamps[0], 'step': 1,'value': String(timestamps[0])})
		        .on('input change', function() {
		        	updatePropSymbols($(this).val().toString());
		            $(".temporal-legend").text(this.value);
		        });

			return slider;
		}

		sliderControl.addTo(map);
		createTemporalLegend(timestamps[0]);
	} // end createSliderUI()
	function createTemporalLegend(startTimestamp) {

		var temporalLegend = L.control({ position: 'bottomleft' });

		temporalLegend.onAdd = function(map) {

			var output = L.DomUtil.create("output", "temporal-legend");

			return output;
		}

		temporalLegend.addTo(map);
		$(".temporal-legend").text(startTimestamp);
	}	// end createTemporalLegend()
});
