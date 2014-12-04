define([
    'ccc/cgf',
    'ccc/def',
    'test/utils'
], function(cgf, def, utils) {

    /*global describe:true, it:true, expect:true, spyOn: true*/

    var When   = utils.describeTerm("when"),
        With   = utils.describeTerm("with"),
        The    = utils.describeTerm("the"),
        Should = utils.itTerm("should");

    // TODO: test it has the same scene, index, versions, vlayer, etc, as the real parent element.

    describe("cgf.dom.PartTemplate -", function() {
        When("#createElement is called", function() {
            Should("throw if it has no parent template", function() {
                var margin = new cgf.dom.PartTemplate();
                expect(function() {
                    margin.createElement();
                }).toThrow();
            });

            Should("not throw if it has a parent template", function() {
                var parent = new cgf.dom.EntityTemplate();
                var margin = new cgf.dom.PartTemplate();

                margin.setParent(parent);

                expect(function() {
                    var elem = parent.createElement();
                    margin.createElement(elem);
                }).not.toThrow();
            });
        });
    });
});