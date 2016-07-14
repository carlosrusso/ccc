define([
  "ccc/def",
  "ccc/pvc",
  "test/utils",
  "test/data-1"
], function(def, pvc, utils, datas) {

  describe("pvc.PlotPanel -", function() {
    describe("`plotSizeMin` option -", function() {

      function createChart(chartType, options) {
        var chartOptions = def.setDefaults(options, {
          width: 200,
          height: 300,
          animate: false,
          interactive: false
        });

        var dataSpec;
        if(chartType === pvc.MetricDotChart){
          dataSpec = datas['relational, category=date|value=qty|value2=sales, 4 categories, constant positive value'];
        }  else {
          dataSpec = datas['relational, category=date|value=qty, 4 categories, constant positive value'];
        }

        var chart = utils.createChart(chartType, chartOptions, dataSpec);
        chart.basePanel._create({});
        // layout has been performed.

        return chart;
      }

      function expectPanelSizeToBeAtLeast(chartType, options, panel, w, h, isCategoric) {
        var chart = createChart(chartType, options, isCategoric);

        function getPanelLayout(chart, panel) {
          switch(panel) {
            case 'main':
              return chart.plotPanels.main.getLayout().size;
            case 'base':
              return chart.basePanel.getLayout().size;
            case 'content':
              return chart.contentPanel.getLayout().gridSize;
          }
        }

        var size = getPanelLayout(chart, panel);

        // Confirm that the space assigned to the main plot is larger than plotSizeMin
        if(w) expect(size.width).not.toBeLessThan(w);
        if(h) expect(size.height).not.toBeLessThan(h);

      }

      function expectPanelSizeToBe(chartType, options, panel, w, h, isCategoric) {
        var chart = createChart(chartType, options, isCategoric);

        function getPanelLayout(chart, panel) {
          switch(panel) {
            case 'main':
              return chart.plotPanels.main.getLayout().size;
            case 'base':
              return chart.basePanel.getLayout().size;
            case 'content':
              return chart.contentPanel.getLayout().gridSize;
          }
        }

        var size = getPanelLayout(chart, panel);

        // Confirm that the space assigned to the main plot is larger than plotSizeMin
        if(w) expect(size.width).toBeCloseTo(w, 2);
        if(h) expect(size.height).toBeCloseTo(h, 2);

      }

      describe("basic behaviour -", function() {

        [
          pvc.PieChart, // inherits from BaseChart
          pvc.BarChart,  // inherits from Categorical
          pvc.MetricDotChart // inherits from Cartesian
        ].forEach(function(chartType) {

          describe("In a " + def.qualNameOf(chartType), function() {

            describe("specifying a `plotSizeMin` larger than the chart's dimensions should force the chart to increase its plot area beyond the specified `width` and `height`", function() {

              it("when `plotSizeMin` is specified as a number", function() {
                expectPanelSizeToBe(chartType, {
                  plotSizeMin: 400
                },'main', 400, 400);
              });

              it("when `plotSizeMin` is specified as an object", function() {
                expectPanelSizeToBeAtLeast(chartType, {
                  plotSizeMin: {width: 400}
                },'main', 400);
              });

              it("when `plotSizeMin` is specified as a string containing a number", function() {
                expectPanelSizeToBeAtLeast(chartType, {
                  plotSizeMin: '400'
                },'main', 400, 400);
              });

            });


            it("but NEVER when `plotSizeMin` is specified as a percentage string (because percentages are not supported)", function() {
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

          });
        });

        [
          //pvc.PieChart, // inherits from BaseChart //TODO: modify code to contain BaseCharts in a contentPanel
          pvc.BarChart,  // inherits from Categorical
          pvc.MetricDotChart // inherits from Cartesian
        ].forEach(function(chartType) {

          describe("In a " + def.qualNameOf(chartType), function() {
            it("when there are absolute paddings", function() {
              expectPanelSizeToBeAtLeast(chartType, {
                contentPaddings: 100,
                plotSizeMin: 400
              }, 'base', 600, 600);
            });

            it("when there are relative paddings", function() {
              expectPanelSizeToBeAtLeast(chartType, {
                contentPaddings: "25%",
                plotSizeMin: 400
              }, 'base', 600, 600);
            });

            it("when there are absolute margins", function() {
              expectPanelSizeToBeAtLeast(chartType, {
                contentMargins: 100,
                plotSizeMin: 400
              }, 'base', 600, 600);
            });

            it("when there are relative margins", function() {
              expectPanelSizeToBeAtLeast(chartType, {
                contentMargins: "25%",
                plotSizeMin: 400
              }, 'base', 600, 600);
            });

          });

        });

      });

      describe("interaction with other options in a categoric chart (pvc.BarChart) -", function() {
        it("bands - should force the chart to INCREASE its content area when specifying a `plotSizeMin` LARGER than the space allocated to the bands", function() {
          //Confirm the space assigned to the main plot is both larger than plotSizeMin and the bands
          // 4 categories: 4*(70+10) = 320 pixels
          expectPanelSizeToBe(pvc.BarChart, {
            baseAxisBandSize: 70,
            baseAxisBandSpacing: 10
          }, 'content', 320);

          // Confirm a small plotSizeMin has not effect on the the space assigned to the content
          // width is enforced by band size
          // height is enforce by option "height"
          expectPanelSizeToBe(pvc.BarChart, {
            plotSizeMin: 250,
            baseAxisBandSize: 70,
            baseAxisBandSpacing: 10
          }, 'content', 320);


          //Confirm the space assigned to the content is plotSizeMin
          expectPanelSizeToBe(pvc.BarChart, {
            plotSizeMin: 400,
            baseAxisBandSize: 70,
            baseAxisBandSpacing: 10
          }, 'content', 400, 400);

        });

        it("should not interfere with specifying an axis offset", function() {
          expectPanelSizeToBe(pvc.BarChart, {
            plotSizeMin: 400,
            axisOffset: 0.45 //90% of the plot area is just padding
          }, 'content', 400, 400);
        });

        it("should not interfere with specifying both an axis offset and a band size", function() {
          // width is enforced by the (relative) axis offset times the band size
          //band size = 4*(70 + 10) = 320 px
          expectPanelSizeToBe(pvc.BarChart, {
            baseAxisBandSize: 70,
            baseAxisBandSpacing: 10,
            baseAxisOffset: 0.05 // 10% of the plot area is just padding
          }, 'content', 355.56, null); // 355.5(5) = 320/(1 - 2*0.05)

          // width and height are enforced by plotSizeMin
          expectPanelSizeToBe(pvc.BarChart, {
            plotSizeMin: 400,
            baseAxisBandSize: 70,
            baseAxisBandSpacing: 10,
            baseAxisOffset: 0.05 //10% of the plot area is just padding
          }, 'content', 400, 400); //3200 =320/0.1

          // width is enforced by band size
          // height is enforce by option "height"
          expectPanelSizeToBe(pvc.BarChart, {
            plotSizeMin: 250,
            baseAxisBandSize: 70,
            baseAxisBandSpacing: 10,
            baseAxisOffset: 0.05 //10% of the plot area is just padding
          }, 'content', 355.56, null);

        });
      });

      //TODO: test interaction of tick rounding with plotSizeMin
      describe("In a cartesian chart (pvc.MetricDotChart),", function() {
        it("when tick rounding", function() {

        });
      });
    });

  });
});
