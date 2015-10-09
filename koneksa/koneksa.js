(function($){
   
    ///HIGHCHARTS
    
    var State = Backbone.Model.extend({});
    
    var States = Backbone.Collection.extend({
        model: State,
        comparator: function (state) {
            // sort by uninsured ratio
            return state.get("number_uninsured")/state.get("population");
        }
    });
    
    var HighChartView = Backbone.View.extend({
        
        render: function () {
            // this needs to call highchart series update
            // and redraw on each collection change event
            // to make it update live
            
            if (this.collection.length === 0) {
                console.log("doing nothing");
            } else {
                console.log("drawing highchart");
                var highchart_dict = this.build_highchart_dict(this.collection);
                console.log(highchart_dict);
                this.$el.highcharts(highchart_dict);
            }
            
            return this;
        },
        
        build_highchart_dict: function (collection) {
            var highchart_dict = 
                {
                    chart: {
                        type: 'column',
                        height: 500
                    },
                    title: {
                        text: 'Total Population and Uninsured Population by State'
                    },
                    subtitle: {
                        text: 'Ordered by Uninsured Ratio'
                    },
                    xAxis: {
                        categories: collection.map("name"),
                        title: {
                            text: null
                        },
                        labels: {
                            step: 1,
                            rotation: -70
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Population',
                            align: 'high'
                        },
                        labels: {
                            overflow: 'justify'
                        }
                    },
                    tooltip: {
                        valueSuffix: ''
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: true
                            }
                        }
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -40,
                        y: 80,
                        floating: true,
                        borderWidth: 1,
                        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                        shadow: true
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        name: 'Total Population',
                        data: collection.map("population")
                    }, {
                        name: 'Uninsured Population',
                        data: collection.map("number_uninsured")
                    }]
                }
            return highchart_dict;
        }
        
    });
    
    var the_states = new States();
    
    var the_highchart = new HighChartView({
        el: "#highchart", 
        collection: the_states
    });
    
    $.getJSON("data.json", function(json) {
        the_states.add(json.data);
        the_highchart.render();
        // testing triggered events
        the_states.trigger("add", "an event");
    });
    
    
 /// GOOGLE MAPS
    
    
    var StatePoly = Backbone.Model.extend({});
    
    var StatePolys = Backbone.Collection.extend({
        model: StatePoly
    });
    
    var map;
    
    var GoogleMapView = Backbone.View.extend({
        render: function () {
            console.log("drawing polys");
            
            // this needs to remove the previous polyline
            // and rerender on each statepolys change event
            // to make it update live
            
            this.collection.each(function (model) {
                this.drawpoly(model);
            }, this);
            
            return this;
        },
        
        drawpoly: function (model) {
            //draws outline of state from model point data
            
            console.log(model.get("name"));
            
            var convert = function (item) {
                return { 
                    lat: parseFloat(item.lat), 
                    lng: parseFloat(item.lng) 
                };
            };
            
            var points = _.map(model.get("point"), convert);
            
            var path = new google.maps.Polyline({
                path: points,
                geodesic: true,
                strokeColor: model.get("colour"),
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            
            path.setMap(map);
        }
    });
    
    var the_statepolys = new StatePolys();
    
    var the_googlemapview = new GoogleMapView({
        el: "#map",
        collection: the_statepolys
    });
    
    window.initMap = function () {
        // the api calls this function when everything is loaded
        console.log("initmap");
        
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 40.0034, lng: -102.0506},
            zoom: 3
        });
        
        console.log("everthing ok here?");
        
        $.getJSON("states.json", function(morejson) {
            the_statepolys.add(morejson.states.state);
            console.log(the_statepolys.length);
            console.log(the_googlemapview.collection.length)
            the_googlemapview.render();
        });
        
        var marker = new google.maps.Marker({
            position: {lat: 40.7111596, lng: -74.0087223},
            map: map,
            title: 'Koneksa'
        });

        $("#map").css({height: "500px"});
    }
    
    
})(jQuery);
