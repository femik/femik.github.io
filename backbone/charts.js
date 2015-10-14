(function ($) {
   
    'use strict';
    
    ///HIGHCHARTS
    
    var State = Backbone.Model.extend({});
    
    var States = Backbone.Collection.extend({
        model: State,
        url: function () {
            return 'data.json';
        },
        // data.json contains population and insurance data by state
        
        parse: function (response) {
            return response.data;
        },
        
        comparator: function (state) {
            // sort by uninsured ratio
            return state.get("number_uninsured") / state.get("population");
        }
    });
    
    var HighChartView = Backbone.View.extend({
        
        initialize: function () {
            this.render();
            this.collection.on("sync", this.render, this);
        },
        
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
                };
            return highchart_dict;
        }
        
    });
    
    
    
 /// GOOGLE MAPS
    
    
    var StatePoly = Backbone.Model.extend({});
    
    var StatePolys = Backbone.Collection.extend({
        model: StatePoly,
        url: function () {
            return 'states.json';
        },
        //states.json contains border/outline data by state
        parse: function (response) {
            return response.states.state;
        }
    });
    
    var GoogleMapView = Backbone.View.extend({
        
        initialize: function () {
            this.map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 40.0034, lng: -102.0506},
                zoom: 3
            });
            
            
            this.render();
            this.collection.the_statepolys.on("sync", this.testrender, this);
            this.collection.the_states.on("sync", this.testrender, this);
        },
        
        testrender: function () {
            console.log("render triggered by sync");
            this.render();
        },
            //left this in to see what happens when the json loads last
            // the sync shoudl just call this.render
        
        render: function () {
            
            // this needs to remove the previous polyline
            // and rerender on each statepolys change event
            // to make it update live
            
            if ((this.collection.the_statepolys.length === 0) ||
                    (this.collection.the_states.length === 0)) {
                   console.log("missing data in map");
            } else {
                var ia = this.collection.the_states.map(function (model) {
                    return parseFloat(model.get("number_insured") / model.get("population"));
                }); //get list of ratios

                this.imin = _.min(ia);
                this.imax = _.max(ia);
                //console.log([this.imin, this.imax]);
                this.collection.the_statepolys.each(function (model) {
                    this.drawpoly(model);
                }, this);
            }
            
            return this;
        },
        
        drawpoly: function (model) {
            //draws outline of state from model point data
            
            console.log(model.get("name"));
            var othermodel = this.collection.the_states.findWhere({name: model.get("name")});
            var insuredRatio =
                parseFloat(othermodel.get("number_insured") / othermodel.get("population"));
            console.log(insuredRatio);
            
            var scaledRatio = ((insuredRatio - this.imin) / (this.imax - this.imin)) + 0.05;
            var fillColor = 'rgb(' + parseInt(255 - 255 * scaledRatio, 10) + ', ' + parseInt(255 * scaledRatio, 10) + ', 65)';
            console.log(fillColor);
            
            var convert = function (item) {
                return {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lng)
                };
            };
            
            var points = _.map(model.get("point"), convert);
            
            var path = new google.maps.Polygon({
                path: points,
                geodesic: true,
                strokeColor: model.get("colour"),
                strokeOpacity: 0.5,
                strokeWeight: 0.5,
                fillColor: fillColor,
                //fillColor: '#00B1B5',
                //fillColor: model.get("colour"), nice looking but useless
                //fillOpacity: scaledRatio
                fillOpacity: 0.6
            });
            
            path.setMap(this.map);
        }
    });
    
    
    /// INITIALISE
    
    var startchart = function () {
    
        var the_states = new States();
        the_states.fetch();

        var the_highchart = new HighChartView({
            el: "#highchart",
            collection: the_states
        });

        var the_statepolys = new StatePolys();
        the_statepolys.fetch();

        window.initMap = function () {
            // called by google map api when dom is ready
            var the_googlemapview = new GoogleMapView({
                el: "#map",
                collection: {
                    the_statepolys: the_statepolys,
                    the_states: the_states
                } //this appears to work as expected
            });
        };
    
    };
    
    startchart();
    
    
})(jQuery);
