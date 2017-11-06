/// <reference path="../../era/era.d.ts" />

class App extends Ui.App {
    constructor() {
        super();

        let vbox = new Ui.VBox();
        this.content = vbox;

        let toolbar = new Ui.ToolBar();
        vbox.append(toolbar);

        let beginButton = new Ui.Button({ text: 'begin' });
        toolbar.append(beginButton);
        this.connect(beginButton, 'press', function () {
            clock.begin();
        });

        let progressbar = new Ui.ProgressBar({
            verticalAlign: 'center', horizontalAlign: 'center', width: 200
        });

        vbox.append(progressbar, true);

        let clock = new Anim.Clock({ duration: 4.0 });
        this.connect(clock, 'timeupdate', function (clock: Anim.Clock, progress: number) {
            progressbar.value = progress;
        });
    }
}
new App();