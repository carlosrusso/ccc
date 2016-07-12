define([
  "ccc/def",
  "ccc/pvc",
  "test/utils",
  "test/data-1"
], function(def, pvc, utils, datas) {

  describe("pvc.PlotPanel: ", function() {

    function createChart(chartType, options) {
      var dataSpec = datas['relational, category=date|value=qty|value2=sales, 4 categories, constant positive value'];
      var chartOptions = def.setDefaults(options, {
        width: 200,
        height: 300,
        animate: false,
        interactive: false
      });

      var chart = utils.createChart(chartType, chartOptions, dataSpec);
      chart.basePanel._create({});
      // layout has been performed.

      return chart;
    }

    function createCategoricChart(chartType, options) {
      var dataSpec = datas['relational, category=date|value=qty|value2=sales, 4 categories, constant positive value'];
      var chartOptions = def.setDefaults(options, {
        width: 200,
        height: 300,
        animate: false,
        interactive: false
      });

      var chart = utils.createChart(chartType, chartOptions, [dataSpec[0], {crosstab: true}]);
      chart.basePanel._create({});
      // layout has been performed.

      return chart;
    }

    function expectMainPanelSizeToBeAtLeast(chartType, options, w, h) {
      var chart = createChart(chartType, options);

      var li = chart.plotPanels.main.getLayout();

      // Confirm that the space assigned to the main plot is larger than plotSizeMin
      if(w) expect(li.size.width).not.toBeLessThan(w);
      if(h) expect(li.size.height).not.toBeLessThan(h);

      return li;
    }

    function expectBasePanelSizeToBeAtLeast(chartType, options, w, h) {
      var chart = createChart(chartType, options);

      var li = chart.basePanel.getLayout();

      // Confirm that the space assigned to the main plot is larger than plotSizeMin
      expect(li.size.width).not.toBeLessThan(w);
      expect(li.size.height).not.toBeLessThan(h);

      return li;
    }

    [
      pvc.PieChart, // inherits from BaseChart
      pvc.BarChart,  // inherits from Categorical
      pvc.MetricDotChart // inherits from Cartesian
    ].forEach(function(chartType) {

      describe("In a " + def.qualNameOf(chartType), function() {

        describe("specifying a `plotSizeMin` larger than the chart's dimensions forces the chart to increase its plot area", function() {

          it("when `plotSizeMin` is specified as a number", function() {
            expectMainPanelSizeToBeAtLeast(chartType, {
              plotSizeMin: 400
            }, 400, 400);
          });

          it("when `plotSizeMin` is specified as an object", function() {
            expectMainPanelSizeToBeAtLeast(chartType, {
              plotSizeMin: {width: 400}
            }, 400);
          });

          it("when `plotSizeMin` is specified as a string containing a number", function() {
            expectMainPanelSizeToBeAtLeast(chartType, {
              plotSizeMin: '400'
            }, 400, 400);
          });

        });


        it("but NEVER when `plotSizeMin` is specified as a percentage string", function() {
          // specifying a percentage would make no sense, as the chart would grow on
          // each iteration of the layout solver
          var chart = createChart(chartType, {
            plotSizeMin: '90%'
          });

          var li = chart.plotPanels.main.getLayout();

          // Confirm that the space assigned to the main plot is larger than plotSizeMin
          expect(li.size.width).toBeLessThan(200);
          expect(li.size.height).toBeLessThan(300);
        });


        xit("when there are absolute paddings", function() {
          expectBasePanelSizeToBeAtLeast(chartType, {
            contentPaddings: 100,
            plotSizeMin: 400
          }, 600, 600);
        });

        it("when there are relative paddings", function() {
          expectBasePanelSizeToBeAtLeast(chartType, {
            contentPaddings: "25%",
            plotSizeMin: 400
          }, 600, 600);
        });

        xit("when there are absolute margins", function() {
          expectBasePanelSizeToBeAtLeast(chartType, {
            contentMargins: 100,
            plotSizeMin: 400
          }, 600, 600);
        });

        it("when there are relative margins", function() {
          expectBasePanelSizeToBeAtLeast(chartType, {
            contentMargins: "25%",
            plotSizeMin: 400
          }, 600, 600);
        });

      });
    });

    describe("in a categoric chart (pvc.BarChart),", function() {

      it("when the space allocated to the bands is smaller than `plotSizeMin`", function() {
        var chart = createCategoricChart(pvc.BarChart, {
          plotSizeMin: 400,
          baseAxisBandSize: 70,
          baseAxisBandSpacing: 10
        });

        // 4 categories: 4*(70+10) = 320 pixels

        var li = chart.contentPanel.getLayout();

        //Confirm the space assigned to the main plot coincides with plotSizeMin
        expect(li.gridSize.width).toBe(400);
      });

      it("when the space allocated to the bands is larger than `plotSizeMin`", function() {
        var chart = createCategoricChart(pvc.BarChart, {
          plotSizeMin: 250,
          baseAxisBandSize: 70,
          baseAxisBandSpacing: 10
        });

        var li = chart.contentPanel.getLayout();

        //Confirm the space assigned to the main plot is both larger than plotSizeMin and the bands
        // 4 categories: 4*(70+10) = 320 pixels
        expect(li.gridSize.width).toBe(320);
      });

      it("when an axis offset is defined", function() {
        expectMainPanelSizeToBeAtLeast(pvc.BarChart, {
          plotSizeMin: 400,
          axisOffset: 0.45 //90% of the plot area is just padding
        }, 400, 400);

      });

      it("when both an axis offset and a band size are defined", function() {
        expectMainPanelSizeToBeAtLeast(pvc.BarChart, {
          plotSizeMin: 400,
          baseAxisBandSize: 70,
          baseAxisBandSpacing: 10,
          axisOffset: 0.45 //90% of the plot area is just padding
        }, 400, 400);

        //expect(li.gridSize.width).toBeGreaterThan(399);
        //expect(li.gridSize.height).toBeGreaterThan(399);
      });
    });

    describe("In a cartesian chart (pvc.MetricDotChart),", function() {
      it("when tick rounding", function() {

      });
    });

  });

});
