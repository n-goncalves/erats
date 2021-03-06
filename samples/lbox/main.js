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
        var lbox = new Ui.LPBox();
        _this.content = lbox;
        lbox.prepend(new Ui.Rectangle().assign({
            fill: 'orange', marginLeft: 40, marginTop: 40, marginBottom: 120, marginRight: 120
        }));
        lbox.prependAtLayer(new Ui.Rectangle().assign({
            fill: 'pink', marginLeft: 60, marginTop: 60, marginBottom: 100, marginRight: 100
        }), 2);
        lbox.prepend(new Ui.Rectangle().assign({
            fill: 'green', marginLeft: 80, marginTop: 80, marginBottom: 80, marginRight: 80
        }));
        lbox.prependAtLayer(new Ui.Rectangle().assign({
            fill: 'purple', marginLeft: 100, marginTop: 100, marginBottom: 60, marginRight: 60
        }), 2);
        return _this;
    }
    return App;
}(Ui.App));
new App();
