define([
    "ccc/def",
    "ccc/pvc",
    "test/utils",
    "test/data-1"
], function(def, pvc, utils, datas) {

    describe("pvc.PlotPanel", function() {

        function createChart(chartType, options){
            //var dataSpec = datas['relational, category=date|value=qty, 4 categories, constant positive value'];
            var dataSpec = datas['cross-tab, category missing on first series'];
            var chartOptions = def.setDefaults(options, {
                width:       200,
                height:      300,
                animate:     false,
                interactive: false
            });

            var chart = utils.createChart(chartType, chartOptions, dataSpec);
            chart.basePanel._create({});
            // layout has been performed.

            return chart;
        }

        // BACKLOG-9174
        describe("respects the `plotSizeMin` option", function() {

            [
                pvc.PieChart, // inherits from BaseChart
                pvc.BarChart  // inherits from Categorical
                //pvc.MetricDotChart // inherits from Cartesian
            ].forEach(function(chartType){

                describe("in a " + def.qualNameOf(chartType), function() {

                    it("when it is specified as an number", function() {
                        var chart = createChart(chartType, {
                            plotSizeMin: 400
                        });

                        var li = chart.plotPanels.main.getLayout();

                        // Confirm that the space assigned to the main plot is larger than plotSizeMin
                        expect(li.size.width).not.toBeLessThan(400);
                        expect(li.size.height).not.toBeLessThan(400);
                    });

                    it("but not when it is specified as a percentage string", function() {
                        var chart = createChart(chartType, {
                            plotSizeMin: "10%"
                        });

                        var li = chart.plotPanels.main.getLayout();

                        //Confirm the space assigned to the main plot is larger than plotSizeMin
                        expect(li.size.width).not.toBeLessThan(400);
                        expect(li.size.height).not.toBeLessThan(400);
                    });

                    it("when it is specified as an object", function() {
                        var chart = createChart(chartType, {
                            plotSizeMin: {width: 400}
                        });

                        var li = chart.plotPanels.main.getLayout();

                        //Confirm the space assigned to the main plot is larger than plotSizeMin
                        expect(li.size.width).toBeGreaterThan(399);
                    });
                });



            });
        });

    });
});