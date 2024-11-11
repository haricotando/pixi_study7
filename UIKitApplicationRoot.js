import { dataProvider, dp } from "./dataProvider.js";
import GraphicsHelper from "./helper/GraphicsHelper.js";
import { UIKitSlider } from "./UIKitSlider.js";
import { UIKitToggleButton } from "./UIKitToggleButton.js";
import Utils from "./Utils.js";

export class UIKitApplicationRoot extends PIXI.Container {
    
    constructor(debug = false) {
        super();

        /**
            * この辺までテンプレ
            * constructor -> アセット読み込み -> init
         */
        this.sortableChildren = true;
        this._debug = debug;
        this.loadAssets();
        
        if(this._debug){
            this.debugAssets = this.addChild(new PIXI.Container());
            this.debugAssets.zIndex = 1000;
            this.initSPFrame();
        }
    }

    /** ------------------------------------------------------------
     * アセット読み込み等完了後スタート
    */
    init(){
        const background = this.addChild(GraphicsHelper.exDrawRect(0, 0, dp.limitedScreen.width, dp.limitedScreen.height, false, {color:0xefefef}));
        Utils.pivotCenter(background);

        let objA = {x:0, y:0};
        const uiSlider = this.addChild(Utils.addUISlider(dp.app, dp.limitedScreen.width - 50, objA, 'x', 0, 100, 50, "objA.x"));
        uiSlider.x = dp.limitedScreen.negativeHalfWidth + 25;

        const uiToggle = this.addChild(Utils.addUIToggleButton(dp.app, background, 'visible', true, 'background'));
        uiToggle.x = dp.limitedScreen.negativeHalfWidth + 25;
        uiToggle.y = 100;
     }

    /** ------------------------------------------------------------
        * アセットをまとめてロード
        * 公式の画像でテスト読み込み
     */
    loadAssets(){
        PIXI.Assets.add('flowerTop', 'https://pixijs.com/assets/flowerTop.png');
        PIXI.Assets.add('eggHead', 'https://pixijs.com/assets/eggHead.png');

        const assetsPromise = PIXI.Assets.load([
            'flowerTop',
            'eggHead',
        ]);
        
        assetsPromise.then((items) => {
            dataProvider.assets = items;
            this.init();
        });
    }
    /** ------------------------------------------------------------
         * resizeHandler
         * 
     */
    resizeHandler(width, height){
        // PCの場合のみAppRootをいい感じにリサイズする
        let paddingFactorW = 0.95
        let paddingFactorH = 0.95;

        let maxW = dataProvider.spRect.width;
        let maxH = dataProvider.spRect.height;

        // 最大表示幅と高さを決める
        let containerMaxWidth = paddingFactorW * window.innerWidth; 
        let containerMaxHeight = paddingFactorH * window.innerHeight;
        
        let resizeRatio = Math.min(containerMaxWidth/maxW, containerMaxHeight/maxH);
        if(containerMaxWidth < maxW || containerMaxHeight < maxH) {
            if(resizeRatio > 0.5){
                resizeRatio = 0.5;
            }
            this.scale.x = resizeRatio;
            this.scale.y = resizeRatio;
        }

        if(this._debug){
            this.updateSPFrame(resizeRatio);
        }
    }

    /** ============================================================
        * Debug時要素
     */
        initSPFrame(){
            let lineColor = 0x00FFFF;
            let lineWidth = 10;
    
            const debugFrame = GraphicsHelper.exDrawRect(
                0, 0, 
                dataProvider.spRect.width,
                dataProvider.spRect.height,
                {
                    color: lineColor,
                    width: lineWidth,
                }, false
            );
    
            debugFrame.pivot.x = debugFrame.width/2;
            debugFrame.pivot.y = debugFrame.height/2;
            this.debugAssets.addChild(debugFrame);
    
            this._labelBackground = GraphicsHelper.exDrawRect(0, 0, 100, 30, false, 0xFFFFFF);
            this._labelBackground.x = 0 - debugFrame.width / 2 + 20;
            this._labelBackground.y = 0 - debugFrame.height / 2 + 20;
    
            this.debugAssets.addChild(this._labelBackground);
            
            this._label = new PIXI.Text('Label');
            this._label.x = 0 - debugFrame.width / 2 + 30;
            this._label.y = 0 - debugFrame.height / 2 + 20;
            this.debugAssets.addChild(this._label);
            this.updateSPFrame();
        }
    
        updateSPFrame(resizeRatio = 1){
            this._label.text = `${Utils.roundTo(this.width, 1)} : ${Utils.roundTo(this.height, 1) } - ${Utils.roundTo(resizeRatio, 1)}`;
            this._labelBackground.width = this._label.width + 20;
        }
}