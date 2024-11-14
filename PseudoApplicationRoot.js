import { dataProvider, dp } from "./dataProvider.js";
import GraphicsHelper from "./helper/GraphicsHelper.js";
import { PseudoText3d } from "./PseudoText3d.js";
import Utils from "./Utils.js";

export class PseudoApplicationRoot extends PIXI.Container {
    
    constructor(debug = false) {
        super();

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
        this.sortableChildren = true;


        this.background = this.addChild(GraphicsHelper.exDrawRect(0, 0, dp.limitedScreen.width, dp.limitedScreen.height, false, {color:0xEFEFEF}))
        Utils.pivotCenter(this.background);
        this.requestDeviceOrientationPermission();
        this.initPseudoText();
        this.studyAround();
    }

    initPseudoText(){
        this.renderData = {
            shadowRadius: 60,
            shadowDegree: 125,
            cameraAngle : 90,
            cameraFOV   : 15,
        };

        /**
         * @todo ここはdataProviderとかに連れて行く
         */
        this.sensorData = {
            gyro:{
                alpha: 0,
                beta : 0,
                gamma: 0,
            },
            acceleration:{
                x: 0,
                y: 0,
                z: 0,
            }
        };

        this.pseudo = this.addChild(new PseudoText3d('AAAA'));
        this.pseudo.y = -50;
        // this.pseudo.y = 260;
    }
    /** ------------------------------------------------------------
     * 
     */
    studyAround(){
        const sliderCameraAngle = this.addChild(Utils.addUISlider(dp.app, dp.limitedScreen.width - 50, this.renderData, 'cameraAngle', 0, 360, this.renderData.cameraAngle, 'cameraAngle'));
        sliderCameraAngle.x = dp.limitedScreen.negativeHalfWidth + 25;
        sliderCameraAngle.y = dp.limitedScreen.negativeHalfHeight + 200;

        const sliderCameraFOV = this.addChild(Utils.addUISlider(dp.app, dp.limitedScreen.width - 50, this.renderData, 'cameraFOV', 0, 50, this.renderData.cameraFOV, 'cameraFOV'));
        sliderCameraFOV.x = dp.limitedScreen.negativeHalfWidth + 25;
        sliderCameraFOV.y = dp.limitedScreen.negativeHalfHeight + 300;

        const sliderShadowRadius = this.addChild(Utils.addUISlider(dp.app, dp.limitedScreen.width - 50, this.renderData, 'shadowRadius', 0, 100, this.renderData.shadowRadius, 'shadowRadius'));
        sliderShadowRadius.x = dp.limitedScreen.negativeHalfWidth + 25;
        sliderShadowRadius.y = dp.limitedScreen.negativeHalfHeight + 400;

        const sliderShadowDegree = this.addChild(Utils.addUISlider(dp.app, dp.limitedScreen.width - 50, this.renderData, 'shadowDegree', 0, 360, this.renderData.shadowDegree, 'shadowDegree'));
        sliderShadowDegree.x = dp.limitedScreen.negativeHalfWidth + 25;
        sliderShadowDegree.y = dp.limitedScreen.negativeHalfHeight + 500;

        this.pointer = this.addChild(GraphicsHelper.exDrawCircle(0, 0, 20, false, {color:0x00FF00}));

        this.tfContainer = this.addChild(new PIXI.Container());
        this.tfContainer.x = dp.limitedScreen.negativeHalfWidth + 20;
        this.tfContainer.y = dp.limitedScreen.negativeHalfHeight + 100;

        this.tf1 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:30}));
        this.tf2 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:30}));
        this.tf2.x = 300;
        this.tf3 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:30}));
        this.tf3.x = 600;
        this.tf4 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:30}));
        this.tf4.y = 50;
        this.tf5 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:30}));
        this.tf5.x = 300;
        this.tf5.y = 50;
        this.tf6 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:30}));
        this.tf6.x = 600;
        this.tf6.y = 50;

        dp.app.ticker.add(() => {
            this.tf1.text = `alpha: ${Utils.roundTo(this.sensorData.gyro.alpha, 1)}`;
            this.tf2.text = `beta: ${Utils.roundTo(this.sensorData.gyro.beta, 1)}`;
            this.tf3.text = `gamma: ${Utils.roundTo(this.sensorData.gyro.gamma, 1)}`;

            this.tf4.text = `x: ${Utils.roundTo(this.sensorData.acceleration.x, 1)}`;
            this.tf5.text = `y: ${Utils.roundTo(this.sensorData.acceleration.y, 1)}`;
            this.tf6.text = `z: ${Utils.roundTo(this.sensorData.acceleration.z, 1)}`;

            // const radian = Utils.degreesToRadians(this.sensorData.gyro.alpha);
            const radian = Utils.degreesToRadians(this.renderData.cameraAngle);
            const destX = this.renderData.cameraFOV * Math.cos(radian);
            const destY = this.renderData.cameraFOV * Math.sin(radian);
            
            // this.renderData.shadowDegree = this.sensorData.gyro.alpha + 90;

            this.pointer.x = destX;
            this.pointer.y = destY;
            this.pseudo.redraw(
                this.renderData.cameraFOV, this.renderData.cameraAngle,
                this.renderData.shadowRadius, this.renderData.shadowDegree,
            );
        });
    }

    /** ------------------------------------------------------------
     *  OSごとの加速度／ジャイロ取得分岐
     */
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
                        window.addEventListener('deviceorientation', this.handleOrientation.bind(this), true);
                        window.addEventListener('devicemotion', this.handleMotion.bind(this), true);
                        this.requestGranted();
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
                window.addEventListener('devicemotion', this.handleMotion.bind(this), true);
                this.requestGranted();
                console.log('許可が不要です');
            }
            button.interactive = false;
            this.removeChild(button);
        });
    }

    /** ------------------------------------------------------------
     *  加速度／ジャイロの取得が許可された時
     */
    requestGranted(){
        this.pointer.zIndex = 100;
        this.initCOMA();
    }
    
    handleOrientation(event) {
        if (event.alpha === undefined) return false;
        this.sensorData.gyro = {
            alpha: event.alpha,
            beta : event.beta,
            gamma: event.gamma,
        };
        
    }

    handleMotion(event){
        if (event.accelerationIncludingGravity.x === undefined) return false;
        this.sensorData.acceleration = {
            x: event.accelerationIncludingGravity.x,
            y: event.accelerationIncludingGravity.y,
            z: event.accelerationIncludingGravity.z,
        }
    }






    
    /** ------------------------------------------------------------
        * アセットをまとめてロード
        * 公式の画像でテスト読み込み
     */
    loadAssets(){
        PIXI.Assets.add('guide', './assets/guide1.jpeg');
        // PIXI.Assets.add('flowerTop', 'https://pixijs.com/assets/flowerTop.png');
        // PIXI.Assets.add('eggHead', 'https://pixijs.com/assets/eggHead.png');

        const assetsPromise = PIXI.Assets.load([
            'guide',
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