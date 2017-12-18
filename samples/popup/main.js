"use strict";
/// <reference path="../../era/era.d.ts" />
var app = new Ui.App();
var popup = new Ui.Popup();
var vbox = new Ui.VBox({ verticalAlign: 'center', horizontalAlign: 'center', spacing: 5 });
app.content = vbox;
var selectable = new Ui.Pressable();
vbox.append(selectable);
selectable.append(new Ui.Rectangle({ width: 50, height: 50, radius: 8, fill: 'lightgreen' }));
selectable.append(new Ui.Label({ text: 'click' }));
app.connect(selectable, 'press', function (item, x, y) {
    console.log('open the menu: ' + x + 'x' + y);
    popup.openAt(x, y);
    //	popup.open(selectable);
});
var button = new Ui.Button({ text: 'open popup' });
vbox.append(button);
app.connect(button, 'press', function () {
    popup.open();
});
var vbox2 = new Ui.VBox({ spacing: 5, margin: 10 });
popup.content = vbox2;
vbox2.append(new Ui.Label({ text: 'bonjour' }));
vbox2.append(new Ui.Separator());
vbox2.append(new Ui.Label({ text: 'bonjour2' }));
vbox2.append(new Ui.Separator());
vbox2.append(new Ui.Label({ text: 'bonjour3' }));
vbox2.append(new Ui.Separator());
vbox2.append(new Ui.Button({ text: 'click me' }));
vbox2.append(new Ui.Separator());
button = new Ui.Button({ text: 'popup' });
vbox2.append(button);
app.connect(button, 'press', function () {
    var newPopup = new Ui.Popup({ autoClose: true });
    var button = new Ui.Button({ text: 'click' });
    newPopup.content = button;
    newPopup.open();
});
button = new Ui.Button({ text: 'close popup' });
vbox.append(button);
app.connect(button, 'press', function () {
    popup.close();
});
var selectable2 = new Ui.Pressable();
vbox.append(selectable2);
selectable2.append(new Ui.Rectangle({ width: 50, height: 50, radius: 8, fill: 'lightgreen' }));
selectable2.append(new Ui.Label({ text: 'click' }));
app.connect(selectable2, 'press', function (item, x, y) {
    console.log('open the menu at element');
    popup.openElement(item);
});
