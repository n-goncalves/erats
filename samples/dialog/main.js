"use strict";
/// <reference path="../../era/era.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App() {
        var _this = _super.call(this) || this;
        _this.content = new Ui.VBox().assign({
            content: [
                new Ui.HBox().assign({
                    content: [
                        new Ui.Button().assign({ text: 'test 1' }),
                        new Ui.Button().assign({ text: 'test 2' })
                    ]
                }),
                new Ui.Button().assign({
                    text: 'Open dialog', resizable: true,
                    verticalAlign: 'center', horizontalAlign: 'center',
                    onpressed: function () {
                        var dialog = new Ui.Dialog({
                            title: 'Test Dialog',
                            actionButtons: [
                                new Ui.Button().assign({ text: 'Previous' }),
                                new Ui.Button().assign({ text: 'Next' })
                            ],
                            content: new Ui.Rectangle().assign({ fill: 'lightgreen', width: 350, height: 200 })
                        });
                        dialog.open();
                    }
                })
            ]
        });
        return _this;
    }
    return App;
}(Ui.App));
new App();
