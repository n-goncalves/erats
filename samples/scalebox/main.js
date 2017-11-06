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
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        var _this = _super.call(this) || this;
        var lbox = new Ui.LBox();
        lbox.margin = 100;
        _this.setContent(lbox);
        var scalebox = new Ui.ScaleBox();
        scalebox.fixedWidth = 800;
        scalebox.fixedHeight = 600;
        lbox.setContent(scalebox);
        var rect = new Ui.Rectangle();
        rect.fill = 'orange';
        scalebox.append(rect);
        var text = new Ui.Text();
        text.margin = 20;
        text.fontSize = 40;
        text.text = 'Hello World !';
        scalebox.append(text);
        return _this;
    }
    return App;
}(Ui.App));
new App();