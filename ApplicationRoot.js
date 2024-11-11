import { dataProvider, dp } from "./dataProvider.js";
import GraphicsHelper from "./helper/GraphicsHelper.js";
import Utils from "./Utils.js";

export class ApplicationRoot extends PIXI.Container {
    
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
            this.debugAssets.addChild(GraphicsHelper.addCross(100, 10));
            this.initSPFrame();
        }
    }

    /** ------------------------------------------------------------
     * アセット読み込み等完了後スタート
    */
    init(){
        this.requestDeviceOrientationPermission();
    }

    requestDeviceOrientationPermission(){
        const button = this.addChild(new PIXI.Container());
        const background = button.addChild(GraphicsHelper.exDrawRect(0, 0, 200, 200, false, {color:0xFF0000}));
        const label = button.addChild(new PIXI.Text('> Request Permission ', {fontFamily:'Inter', fontSize: 60, fontWeight: 500, fill:0xFFFFFF}));
        background.width = label.width;
        background.height = label.height;
        Utils.pivotCenter(button);
        button.y = -200;

        button.interactive = true;
        button.buttonMode = true;
        button.on("pointertap", () => {
            if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
              // iOS 13以降でのアクセス許可リクエスト
                DeviceOrientationEvent.requestPermission()
                .then((response) => {
                    if (response === "granted") {
                        /**
                         * @todo このbindでよかったんだろうか？
                         */
                        window.addEventListener("deviceorientation", this.handleOrientation.bind(this), true);
                        console.log('許可が付与されました');
                    } else {
                        console.log('許可が拒否されました');
                    }
                })
                .catch((error) => {
                    console.error("Permission request error:", error);
                    console.log('エラーが発生しました');
                });
            } else {
                // AndroidやPCなど、許可リクエストが不要なブラウザの場合
                window.addEventListener("deviceorientation", this.handleOrientation.bind(this), true);
                console.log('許可が不要です');
            }
            button.interactive = false;
            this.removeChild(button);
            initCOMA();
        });

        this.tfContainer = this.addChild(new PIXI.Container());
        this.tfContainer.x = dp.limitedScreen.negativeHalfWidth + 20;
        this.tfContainer.y = dp.limitedScreen.negativeHalfHeight + 50;

        this.tf1 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf2 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf2.y = 50;
        this.tf3 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf3.y = 100;
    }
    
    // デバイスの向きデータを取得する関数
    handleOrientation(event) {
        this.tf1.text = `alpha: ${Utils.roundTo(event.alpha, 1)}`;
        this.tf2.text = `beta: ${Utils.roundTo(event.beta, 1)}`;
        this.tf3.text = `gamma: ${Utils.roundTo(event.gamma, 1)}`;
    }

    initCOMA(){
        
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