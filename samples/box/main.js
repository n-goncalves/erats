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
        var orientationButton = new Ui.Button({ text: 'change orientation' });
        toolbar.append(orientationButton, true);
        _this.connect(orientationButton, 'press', function () {
            if (box.orientation == 'horizontal')
                box.orientation = 'vertical';
            else
                box.orientation = 'horizontal';
        });
        var uniformButton = new Ui.Button({ text: 'change uniform' });
        toolbar.append(uniformButton, true);
        _this.connect(uniformButton, 'press', function () { return box.uniform = !box.uniform; });
        var resizableButton = new Ui.Button({ text: 'change resizable (green)' });
        toolbar.append(resizableButton, true);
        _this.connect(resizableButton, 'press', function () {
            if (Ui.Box.getResizable(greenRect))
                Ui.Box.setResizable(greenRect, false);
            else
                Ui.Box.setResizable(greenRect, true);
        });
        var box = new Ui.Box();
        vbox.append(box, true);
        box.append(new Ui.Rectangle({ width: 50, height: 50, fill: 'lightblue' }));
        var greenRect = new Ui.Rectangle({ width: 100, height: 100, fill: 'lightgreen' });
        box.append(greenRect, false);
        box.append(new Ui.Rectangle({ width: 50, height: 50, fill: 'orange' }));
        return _this;
    }
    return App;
}(Ui.App));
new App();