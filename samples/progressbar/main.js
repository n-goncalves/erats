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
        var vbox = new Ui.VBox();
        _this.content = vbox;
        var toolbar = new Ui.ToolBar();
        vbox.append(toolbar);
        var beginButton = new Ui.Button({ text: 'begin' });
        toolbar.append(beginButton);
        _this.connect(beginButton, 'press', function () {
            clock.begin();
        });
        var progressbar = new Ui.ProgressBar({
            verticalAlign: 'center', horizontalAlign: 'center', width: 200
        });
        vbox.append(progressbar, true);
        var clock = new Anim.Clock({ duration: 4.0 });
        _this.connect(clock, 'timeupdate', function (clock, progress) {
            progressbar.value = progress;
        });
        return _this;
    }
    return App;
}(Ui.App));
new App();