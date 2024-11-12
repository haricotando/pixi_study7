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

        this.background = this.addChild(GraphicsHelper.exDrawRect(0, 0, dp.limitedScreen.width, dp.limitedScreen.height, false, {color:0xEFEFEF}))
        Utils.pivotCenter(this.background);
        this.requestDeviceOrientationPermission();
        this.initCOMA();
        this.studyAround();
        this.sortableChildren = true;
    }

    studyAround(){
        let obj = {degree:0, radius:100};
        const slider = this.addChild(Utils.addUISlider(dp.app, dp.limitedScreen.width - 50, obj, 'radius', 10, 300, 5));
        slider.x = dp.limitedScreen.negativeHalfWidth + 25;
        slider.y = dp.limitedScreen.negativeHalfHeight + 500;
        this.pointer = this.addChild(GraphicsHelper.exDrawCircle(0, 0, 20, false, {color:0x00FF00}))

        dp.app.ticker.add(() => {
            this.tf1.text = `alpha: ${Utils.roundTo(this.sensorData.gyro.alpha, 1)}`;
            this.tf2.text = `beta: ${Utils.roundTo(this.sensorData.gyro.beta, 1)}`;
            this.tf3.text = `gamma: ${Utils.roundTo(this.sensorData.gyro.gamma, 1)}`;

            this.tf4.text = `x: ${Utils.roundTo(this.sensorData.acceleration.x, 1)}`;
            this.tf5.text = `y: ${Utils.roundTo(this.sensorData.acceleration.y, 1)}`;
            this.tf6.text = `z: ${Utils.roundTo(this.sensorData.acceleration.z, 1)}`;

            const radian = Utils.degreesToRadians(this.sensorData.gyro.alpha);
            const destX = obj.radius * Math.cos(radian);
            const destY = obj.radius * Math.sin(radian);
            this.pointer.x = destX;
            this.pointer.y = destY;

            this.dropShadowFilter.offset.x = 0 - this.sensorData.gyro.gamma;
            this.dropShadowFilter.offset.y = this.sensorData.gyro.beta + 20
            
        });
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
                        window.addEventListener('deviceorientation', this.handleOrientation.bind(this), true);
                        window.addEventListener('devicemotion', this.handleMotion.bind(this), true);
                        
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
                console.log('許可が不要です');
            }
            button.interactive = false;
            this.removeChild(button);
            this.pointer.zIndex = 100;
            this.initCOMA();
        });

        this.tfContainer = this.addChild(new PIXI.Container());
        this.tfContainer.x = dp.limitedScreen.negativeHalfWidth + 20;
        this.tfContainer.y = dp.limitedScreen.negativeHalfHeight + 100;

        this.tf1 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf2 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf2.y = 50;
        this.tf3 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf3.y = 100;

        this.tf4 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf4.y = 150;
        this.tf5 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf5.y = 200;
        this.tf6 = this.tfContainer.addChild(new PIXI.Text('00000', {fontSize:40}));
        this.tf6.y = 250;
    }
    
    // デバイスの向きデータを取得する関数
    handleOrientation(event) {
        if(event.alpha == undefined){
            return false;
        }
        this.sensorData.gyro = {
            alpha: event.alpha,
            beta : event.beta,
            gamma: event.gamma,
            
        };
        
    }

    handleMotion(event){
        if(event.accelerationIncludingGravity.x == undefined){
            return false;
        }
        this.sensorData.acceleration = {
            x: event.accelerationIncludingGravity.x,
            y: event.accelerationIncludingGravity.y,
            z: event.accelerationIncludingGravity.z,

        }
    }

    initCOMA(){
        let text = 'COMA';
            this.container = this.addChild(new PIXI.Container());
            this.shadows   = this.container.addChild(new PIXI.Container());
            
            /**
             * フロントフェイスText
            */
            const textStyle = new PIXI.TextStyle({
                fontFamily: 'Inter',
                fontSize  : 300,
                fontWeight: 800,
                fill      : [0xFFFFFF, 0xEFEFEF],
            //    fill             : [0xEFEFEF, 0xE7E0E0],
            //    fill             : [0xE7E0E0, 0xD3CDCD],
                align            : 'center',
                fillGradientType : 0,
                fillGradientStops: [0.3, 0.9, 1],
            });
            
            const glowStyle = Utils.cloneTextStyle(textStyle, {fill: 0xFFFFFF});
            const glowText = this.container.addChild(new PIXI.Text(text, glowStyle));
            
            const dropshadowStyle = Utils.cloneTextStyle(textStyle,  {fill: 0xFFFFFF});
            const dropshadowText = this.container.addChild(new PIXI.Text(text, dropshadowStyle));
            
            this.sideFace = this.container.addChild(new PIXI.Container());
            const mainText = new PIXI.Text(text, textStyle);
            this.container.addChild(mainText);
            Utils.pivotCenter(this.container);
    
    
            /**
             * サイドフェイス
             */
            const layers = 10;
            const sideDepth = 1.5;
            // let sideStyle = Utils.cloneTextStyle(textStyle, {fill: 0x888888});
            let sideStyle = Utils.cloneTextStyle(textStyle, {fill: 0xD4D0C8});
            let lastSide = undefined;
            // サイドフェイス幅に合わせて中心寄せ
            for (let i = 0; i < layers; i++) {
                const side = this.sideFace.addChild(new PIXI.Text(text, sideStyle));
                side.y = i * sideDepth;
                if(lastSide){
                    side.width -= sideDepth * i;
                    side.x = i * (lastSide.width - side.width) / 2 * sideDepth;
                }
                lastSide = side;
            }
            this.sideFace.alpha = 0.4;
    
            /**
             * シャドウText
             */
            const shadowTextStyle = Utils.cloneTextStyle(textStyle);
            const shadowDepth = 30;
    
            for (let i = 0; i < shadowDepth; i++) {
                const shadowText = new PIXI.Text(text, shadowTextStyle);
                shadowText.x = mainText.x - i * 1.5;
                shadowText.y = mainText.y + i * 1.5;
                shadowText.tint = 0x888888; // 暗めの影
                shadowText.alpha = ((shadowDepth - i) / shadowDepth) * 0.2;
                this.shadows.addChild(shadowText);
            }
    
            for (let i = 0; i < shadowDepth; i++) {
                const shadowText = new PIXI.Text(text, shadowTextStyle);
                shadowText.x = mainText.x - i * 1.5;
                shadowText.y = mainText.y + i * 1.5 - 10;
                shadowText.tint = 0x888888; // 暗めの影
                shadowText.alpha = ((shadowDepth - i) / shadowDepth) * 0.2;
                this.shadows.addChild(shadowText);
            }
            
            this.shadows.y = 10;
    
            this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
                color     : 0x000000,
                alpha     : 0.5,
                blur      : 4,
                quality   : 4,
                offset    : {x:-4, y:8},
                shadowOnly: true,
            });
            
            dropshadowText.filters = [this.dropShadowFilter];
            
            this.glowFilter = new PIXI.filters.DropShadowFilter({
                color  : 0xFFFFFF,
                alpha  : 0.9,
                blur   : 4,
                quality: 4,
                offset : {x:4, y:-8},
                quality: 4,
                shadowOnly: true,
            });
            glowText.filters = [this.glowFilter];
    
            /**
             * @todo スマホだとoffsetが小さい点が気になる
             */
            if(Utils.isMobileDevice()){
                this.dropShadowFilter.offset.x *= 2;
                this.dropShadowFilter.offset.y *= 2;
                this.glowFilter.offset.x *= 2;
                this.glowFilter.offset.y *= 2;
            }
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