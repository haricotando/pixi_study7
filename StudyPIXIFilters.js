import { dataProvider } from "./dataProvider.js";
import GraphicsHelper from "./helper/GraphicsHelper.js";
import { UIKitSlider } from "./UIKitSlider.js";

export class StudyPIXIFilters extends PIXI.Container {

    /* ============================================================
        constructor
    ============================================================ */
    constructor(appScreen) {
        super();
        this.init();
        // this.applyBulge();
        this.applyGlitch();
        
    }

    init(){
        this.fxContainer = new PIXI.Container();
        this.addChild(this.fxContainer);
        let background = PIXI.Sprite.from('/assets/grid_bg.jpg');
        // let background = PIXI.Sprite.from('assets/star.png');
        this.fxContainer.addChild(background);
        background.anchor.set(0.5);
        background.scale.set(1.5)

        // ベースにDisplacementFilterを適応する場合
        let displacementTexture = PIXI.Texture.from('assets/displacement_map.png');
        let displacementSprite = new PIXI.Sprite(displacementTexture);
        let displacementFilter = new PIXI.DisplacementFilter(displacementSprite);
        displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        this.fxContainer.addChild(displacementSprite);
        // apply filter
        background.filters = [displacementFilter];

        displacementFilter.scale.x = 50;
        displacementFilter.scale.y = 50;
        dataProvider.app.ticker.add(() => {
            // スプライトを少しずつ移動させて、ディスプレイスメントエフェクトをアニメーション化
            displacementSprite.x += 1;
            displacementSprite.y += 1;
        });
    }

    applyBulge(){
        let filter = new PIXI.filters.BulgePinchFilter({
            center: [0.5, 0.5], // 画像の中央に効果を適用
            radius: 400,        // 効果の半径
            strength: 1       // 効果の強さ（1で最大膨張、-1で最大縮小）
        });
        this.fxContainer.filters = [filter];

        let slider1 = this.initSlider(filter, 'radius', 0, 500);
        slider1.y = window.innerHeight/2 - 100;

        let slider2 = this.initSlider(filter, 'strength', -1, 1);
        slider2.y = window.innerHeight/2 - 200;
    }


    applyGlitch(){
        let filter = new PIXI.filters.GlitchFilter({
            slices: 20,
            direction: 10,
            offset: 10
        });
        this.fxContainer.filters = [filter];

        let slider1 = this.initSlider(filter, 'direction', 0, 180);
        slider1.y = window.innerHeight/2 - 100;

        let slider2 = this.initSlider(filter, 'direction', 0, 100);
        slider2.y = window.innerHeight/2 - 200;
    }


    initSlider(target, keyString, minVal, maXVal){
        let slider = this.addChild(new UIKitSlider(dataProvider.app, window.innerWidth-100, minVal, maXVal));
        slider.x = 0 - window.innerWidth/2 + 50;
        slider.y = window.innerHeight/2-100;

        slider.on('customEvent', (data) => {
            target[keyString] = data.value;
        });

        return slider;
    }

    /* ============================================================
        TEMPORARY
    ============================================================ */
    resizeHandler(width, height){
        console.log('AppRoot: ResizeHandler');
    }
}