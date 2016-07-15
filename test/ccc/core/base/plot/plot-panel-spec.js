define([
  "ccc/def",
  "ccc/pvc",
  "test/utils",
  "test/data-1"
], function(def, pvc, utils, datas) {

  describe("pvc.PlotPanel", function() {

    describe("`plotSizeMin` option", function() {

      function createChart(chartType, options) {
        var chartOptions = def.setDefaults(options, {
          width: 200,
          height: 300,
          animate: false,
          interactive: false,
          // Reset
          autoPaddingByDotSize: false, // relevant for MetricDotChart
          axisOffset: 0,
          margins: 0,
          paddings: 0,
          contentPaddings: 0,
          contentMargins: 0
        });

        var dataSpec;
        if(chartType === pvc.MetricDotChart) {
          dataSpec = datas['relational, category=date|value=qty|value2=sales, 4 categories, constant positive value, increasing value'];
        } else {
          dataSpec = datas['relational, category=date|value=qty, 4 categories'];
        }

        var chart = utils.createChart(chartType, chartOptions, dataSpec);
        chart.basePanel._create({});
        // layout has been performed.

        return chart;
      }

      function getPanelLayoutSize(chartType, options, panel) {
        var chart = createChart(chartType, options);
        switch(panel) {
          case 'main':
            return chart.plotPanels.main.getLayout().size;
          case 'base':
            return chart.basePanel.getLayout().size;
          case 'content':
            return chart.contentPanel.getLayout().gridSize;
        }
      }

      function expectPanelSizeToBeAtLeast(chartType, options, panel, w, h) {
        var size = getPanelLayoutSize(chartType, options, panel);

        if(w) expect(size.width).not.toBeLessThan(w);
        if(h) expect(size.height).not.toBeLessThan(h);
      }

      function expectPanelSizeToBe(chartType, options, panel, w, h) {
        var size = getPanelLayoutSize(chartType, options, panel);

        if(w) expect(size.width).toBeCloseTo(w, 2);
        if(h) expect(size.height).toBeCloseTo(h, 2);
      }

      function expectPanelSizeToBeAtMost(chartType, options, panel, w, h) {
        var size = getPanelLayoutSize(chartType, options, panel);

        if(w) expect(size.width).not.toBeGreaterThan(w);
        if(h) expect(size.height).not.toBeGreaterThan(h);
      }

      function expectPanelSizeToBeWithin(chartType, options, panel, w, h) {
        var size = getPanelLayoutSize(chartType, options, panel);

        if(w) {
          expect(size.width).not.toBeLessThan(w[0]);
          expect(size.width).not.toBeGreaterThan(w[1]);
        }

        if(h) {
          expect(size.height).not.toBeLessThan(h[0]);
          expect(size.height).not.toBeGreaterThan(h[1]);
        }

      }

      describe("basic behaviour", function() {

        [
          pvc.PieChart, // inherits from BaseChart
          pvc.BarChart,  // inherits from Categorical
          pvc.MetricDotChart // inherits from Cartesian
        ].forEach(function(chartType) {

          describe("In a " + def.qualNameOf(chartType), function() {

            describe("specifying a `plotSizeMin` larger than the chart's dimensions " +
              "should force the chart to increase its plot area beyond the " +
              "specified `width` and `height`", function() {

              it("when `plotSizeMin` is specified as a number", function() {
                expectPanelSizeToBe(chartType, {
                  plotSizeMin: 400
                }, 'main', 400, 400);
              });

              it("when `plotSizeMin` is specified as an object", function() {
                expectPanelSizeToBe(chartType, {
                  plotSizeMin: {width: 400}
                }, 'main', 400);
              });

              it("when `plotSizeMin` is specified as a string containing a number", function() {
                expectPanelSizeToBe(chartType, {
                  plotSizeMin: '400'
                }, 'main', 400, 400);
              });


              it("but NEVER when `plotSizeMin` is specified as a percentage string " +
                "(because percentages are not supported)", function() {
                // specifying a percentage would make no sense, as the chart would grow on
                // each iteration of the layout solver
                expectPanelSizeToBeAtMost(chartType, {
                  plotSizeMin: '90%'
                }, 'main', 200, 300);

              });
            });

          });

        });

        [
          //pvc.PieChart, // inherits from BaseChart //TODO: modify code to contain BaseCharts in a contentPanel
          pvc.BarChart,  // inherits from Categorical
          pvc.MetricDotChart // inherits from Cartesian
        ].forEach(function(chartType) {

          describe("In a " + def.qualNameOf(chartType), function() {
            it("the base panel should be within acceptable bounds when there are no content paddings nor content margins", function() {
              expectPanelSizeToBe(chartType, {
                plotSizeMin: 400,
                axisLabel_visible: false,
                baseAxisSize: 50,
                orthoAxisSize: 50
              }, 'base', 450, 450);
            });

            it("the base panel should grow when there are absolute paddings", function() {
              expectPanelSizeToBe(chartType, {
                plotSizeMin: 400,
                axisLabel_visible: false,
                baseAxisSize: 50,
                orthoAxisSize: 50,
                //
                contentPaddings: 100
              }, 'base', 650, 650);
              // 450 + 2*100 == 650
            });

            it("the base panel should grow when there are relative paddings", function() {
              expectPanelSizeToBe(chartType, {
                plotSizeMin: 400,
                axisLabel_visible: false,
                baseAxisSize: 50,
                orthoAxisSize: 50,
                //
                contentPaddings: "30%"
              }, 'base', 1125, 1125);
              // 450/(1 - 2*0.30) == 1125
            });

            it("the base panel should grow when there are absolute margins", function() {
              expectPanelSizeToBe(chartType, {
                plotSizeMin: 400,
                axisLabel_visible: false,
                baseAxisSize: 50,
                orthoAxisSize: 50,
                //
                contentMargins: 100
              }, 'base', 650, 650);
              // 450 + 2*100 == 650
            });

            it("the base panel should grow when there are relative margins", function() {
              expectPanelSizeToBe(chartType, {
                plotSizeMin: 400,
                axisLabel_visible: false,
                baseAxisSize: 50,
                orthoAxisSize: 50,
                //
                contentMargins: "30%"
              }, 'base', 1125, 1125);
              // 450/(1 - 2*0.30) == 1125
            });

            it("the base panel should grow when there are both absolute margins and paddings", function() {
              expectPanelSizeToBe(chartType, {
                plotSizeMin: 400,
                axisLabel_visible: false,
                baseAxisSize: 50,
                orthoAxisSize: 50,
                //
                contentMargins: 100,
                contentPaddings: 33
              }, 'base', 716, 716);
              // 450 + 2*100 + 2*33 == 716
            });

          });

        });

      });

      describe("interaction with other options in a categorical axis", function() {

        describe("Bands with a fixed size", function() {
          it("should force the chart to INCREASE its content area " +
            " when specifying a `plotSizeMin` LARGER than the space allocated to the bands", function() {
            //Confirm the space assigned to the main plot is both larger than plotSizeMin and the bands
            // 4 categories: 4*(70+10) = 320 pixels
            expectPanelSizeToBe(pvc.BarChart, {
              baseAxisBandSize: 70,
              baseAxisBandSpacing: 10
            }, 'content', 320);
          });

          it("should not influence the content area " +
            " when specifying a `plotSizeMin` SMALLER than the space allocated to the bands", function() {
            // Confirm a small plotSizeMin has not effect on the the space assigned to the content
            // width is enforced by band size
            // height is enforce by option "height"
            expectPanelSizeToBe(pvc.BarChart, {
              plotSizeMin: 250,
              baseAxisBandSize: 70,
              baseAxisBandSpacing: 10
            }, 'content', 320);
          });

          it("should force the chart to INCREASE its content area " +
            " when specifying a `plotSizeMin` LARGER than the space allocated to the bands", function() {
            //Confirm the space assigned to the content is plotSizeMin
            expectPanelSizeToBe(pvc.BarChart, {
              plotSizeMin: 400,
              baseAxisBandSize: 70,
              baseAxisBandSpacing: 10
            }, 'content', 400, 400);

          });
        });

        describe("Axis offset", function() {
          it("should be contained within the original `width`, `height` when `plotSizeMin` is specified", function() {
            expectPanelSizeToBeAtMost(pvc.BarChart, {
              axisOffset: 0.45 //90% of the plot area is just padding
            }, 'content', 200, 300);
          });

          it("should force the content size when `plotSizeMin` is specified", function() {
            expectPanelSizeToBe(pvc.BarChart, {
              axisOffset: 0.45, //90% of the plot area is just padding
              plotSizeMin: 400
            }, 'content', 400, 400);
          });
        });

        describe("Both a fixed band size and a axis offset", function() {

          it("control case: when `plotSizeMin` is not specified", function() {
            // width is enforced by the (relative) axis offset times the band size
            //band size = 4*(70 + 10) = 320 px
            expectPanelSizeToBe(pvc.BarChart, {
              baseAxisBandSize: 70,
              baseAxisBandSpacing: 10,
              baseAxisOffset: 0.05 // 10% of the plot area is just padding
            }, 'content', 355.56, null); // 355.5(5) = 320/(1 - 2*0.05)
          });

          it("should not influence the content area when `plotSizeMin` is smaller than the control case", function() {
            // width is enforced by band size
            // height is enforce by option "height"
            expectPanelSizeToBe(pvc.BarChart, {
              baseAxisBandSize: 70,
              baseAxisBandSpacing: 10,
              baseAxisOffset: 0.05, //10% of the plot area is just padding
              //
              plotSizeMin: 250
            }, 'content', 355.56, null);
          });

          it("should force the content area to grow when `plotSizeMin` is larger than the control case", function() {
            // width and height are enforced by plotSizeMin
            expectPanelSizeToBe(pvc.BarChart, {
              baseAxisBandSize: 70,
              baseAxisBandSpacing: 10,
              baseAxisOffset: 0.05, //10% of the plot area is just padding
              //
              plotSizeMin: 400
            }, 'content', 400, 400);
          });

        });

      });

      fdescribe("interaction with other options in a continuous axis", function() {

        describe("The space used by vertical tick rounding should be deduced from orthoAxisOffset", function() {

          function expectSameOrthoAxisOffset(options, orthoAxisOffset) {

            /**
             * The maximum of the dataset is 19, and there are ticks until 21.
             * Hence, the padding introduced by tick rounding is (21-19)/21
             *
             * By adding this space to the effective padding of the main panel,
             * we should recover the original orthoAxisOffset
             */

            var chart = createChart(pvc.BarChart, def.copyOwn({
                //axisLabel_visible: false,
                baseAxisSize: 50,
                orthoAxisSize: 50,
                orthoAxisOffset: orthoAxisOffset,
                orthoAxisTickUnit: 3,
                orthoAxisOriginIsZero: true,
                orthoAxisDomainRoundMode: 'tick',
                contentPaddings: 10
              }, options)
            );

            var m = chart.plotPanels.main.getLayout();

            var realOrthoAxisOffset = ( m.paddings.top + m.clientSize.height * 2 / 21 ) / m.size.height;
            expect(realOrthoAxisOffset).toBeCloseTo(orthoAxisOffset, 2);
          }

          it("control case, when the dimensions are fixed ", function() {
            expectSameOrthoAxisOffset({
              height: 470 // 470 = 400 + 50 + 2*10
            }, 0.4);

            // should be independent of the actual choice of orthoAxisOffset
            expectSameOrthoAxisOffset({
              height: 470 // 470 = 400 + 50 + 2*10
            }, 0.1);
          });

          it("humm, it doesn't work for small axis offsets ", function() {
            expectSameOrthoAxisOffset({
              height: 470 // 470 = 400 + 50 + 2*10
            }, 0.01);
          });

          it("same final result, but obtained by forcing a size with `plotSizeMin`", function() {

            expectSameOrthoAxisOffset({
              plotSizeMin: 400 // 400 + 50 + 2*10 = 470
            }, 0.4);

            expectSameOrthoAxisOffset({
              plotSizeMin: 400 // 400 + 50 + 2*10 = 470
            }, 0.1);

          });

        });

      });

      describe("interaction with other options in a continuous axis, specific to a pvc.MetricDotChart", function() {
        it("when", function() {

        });
      });

    });

  });
})
;
