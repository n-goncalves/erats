"use strict";
/// <reference path="../../era/era.d.ts" />
//
// A Transformable is an element that can be moved, rotate and scale
// by user interaction. rotate and scale are only available with
// devices that provide touch events and support at least two fingers
//
var app = new Ui.App();
// define a playing area
var fixed = new Ui.Fixed();
app.content = fixed;
//
// If nothing special specified, the transformable
// has no limit
//
/*var transformable = new Ui.Transformable();
var lbox = new Ui.LBox();
lbox.append(new Ui.Rectangle({ width: 150, height: 150, fill: 'orange', radius: 8 }));
lbox.append(new Ui.Label({ text: 'free transform' }));
transformable.content = lbox;
fixed.append(transformable, 50, 50);*/
var transformable;
var lbox = new Ui.LBox();
lbox.append(new Ui.Rectangle({ width: 150, height: 150, fill: 'orange', radius: 8 }));
lbox.append(new Ui.Label({ text: 'free transform' }));
fixed.append(lbox, 50, 50);
new Ui.TransformableWatcher({
    element: lbox,
    transform: function (w, t) { return w.element.transform = w.matrix; }
});
//
// Define another transformable but attach a function to the
// transform event. The transform event allow the application
// to known what transform are applied. It also allow to limit
// the transformation by using the setContentTransform and change
// some transform properties.
// In this example, the element move is disabled by always setting
// x = 0 and y = 0.
//
function onRotateScaleTransform(transformable) {
    app.disconnect(transformable, 'transform', onRotateScaleTransform);
    transformable.setContentTransform(0, 0, undefined, undefined);
    app.connect(transformable, 'transform', onRotateScaleTransform);
}
;
transformable = new Ui.Transformable();
lbox = new Ui.LBox();
lbox.append(new Ui.Rectangle({ width: 150, height: 150, fill: 'lightgreen', radius: 8 }));
lbox.append(new Ui.Label({ text: 'rotate/scale' }));
transformable.content = lbox;
fixed.append(transformable, 350, 50);
app.connect(transformable, 'transform', onRotateScaleTransform);
//
// In this example, the element scale is limited between 1 and 2
//
function onLimitedScaleTransform(transformable) {
    var scale = transformable.scale;
    if ((scale < 1) || (scale > 2)) {
        scale = Math.min(2, Math.max(1, scale));
        app.disconnect(transformable, 'transform', onLimitedScaleTransform);
        transformable.setContentTransform(undefined, undefined, scale, undefined);
        app.connect(transformable, 'transform', onLimitedScaleTransform);
    }
}
;
transformable = new Ui.Transformable();
transformable.inertia = true;
lbox = new Ui.LBox();
lbox.append(new Ui.Rectangle({ width: 150, height: 150, fill: 'lightblue', radius: 8 }));
lbox.append(new Ui.Label({ text: 'limited scale 2x' }));
transformable.content = lbox;
fixed.append(transformable, 50, 350);
app.connect(transformable, 'transform', onLimitedScaleTransform);
//
// In this example, the element rotation jump between 90 degree step values
//
function onStepRotateTransform(transformable) {
    var angle = transformable.angle;
    angle = Math.round(angle / 90) * 90;
    app.disconnect(transformable, 'transform', onStepRotateTransform);
    transformable.setContentTransform(0, 0, 1, angle);
    app.connect(transformable, 'transform', onStepRotateTransform);
}
;
transformable = new Ui.Transformable();
lbox = new Ui.LBox();
lbox.append(new Ui.Rectangle({ width: 150, height: 150, fill: 'pink', radius: 8 }));
lbox.append(new Ui.Label({ text: 'step rotate' }));
transformable.content = lbox;
fixed.append(transformable, 350, 350);
app.connect(transformable, 'transform', onStepRotateTransform);
//
// This example, just demonstrate that we can put button in the content
// of a transformable.
//
transformable = new Ui.Transformable();
lbox = new Ui.LBox();
lbox.append(new Ui.Rectangle({ width: 150, height: 150, fill: 'purple', radius: 8 }));
var vbox = new Ui.VBox({ uniform: true, padding: 20 });
lbox.append(vbox);
vbox.append(new Ui.Button({ text: 'button1' }));
vbox.append(new Ui.Button({ text: 'button2' }));
vbox.append(new Ui.Button({ text: 'button3' }));
transformable.content = lbox;
fixed.append(transformable, 650, 50);
//# sourceMappingURL=main.js.map