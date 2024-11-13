import { dataProvider, dp } from "./dataProvider.js";
import GraphicsHelper from "./helper/GraphicsHelper.js";
import Utils from "./Utils.js";

export class PseudoText3d extends PIXI.Container {
    
    constructor(text = 'AOOA') {
        super();

        this.sortableChildren = true;
        /**
         * テキストスタイル
         */
        /* ここは引数として受け取った方が良い */
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

        
        
        /**
         * フロントフェイスを作成
        */
        this.frontFace = new PIXI.Text(text, textStyle);
        this.addChild(this.frontFace);

        /**
        * サイドフェイスを作成
       */
        this.sideFace = this.addChild(new PIXI.Container());
        const sideStyle = Utils.cloneTextStyle(textStyle, {fill: 0xCBCBCB});
        const numOfSideLayer = 10;
        this._sideFaceList = [];
        for (let i = 0; i < numOfSideLayer; i++) {
            const side = this._sideFaceList.push(this.sideFace.addChild(new PIXI.Text(text, sideStyle)));
        }
        this.sideFace.alpha = 0.4;

        /**
         * シャドウを作成
        */
        this.shadows = this.addChild(new PIXI.Container());
        const shadowStyle = Utils.cloneTextStyle(textStyle, {fill: 0x333333});
        const numOfShadowLayer = 20;
        this._shadowList = [];
        for (let i = 0; i < numOfShadowLayer; i++) {
            const shadow = this.shadows.addChild(new PIXI.Text(text, shadowStyle));
            shadow.alpha = ((numOfShadowLayer - i) / numOfShadowLayer) * 0.2;
            this._shadowList.push(shadow);
        }
        
        /**
         * ドロップシャドウ
         */
        const dropshadowStyle = Utils.cloneTextStyle(textStyle, {fill: 0xFFFFFF});
        this.dropshadowText = this.addChild(new PIXI.Text(text, dropshadowStyle));

        this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
            color     : 0x0000FF,
            color     : 0x333333,
            alpha     : 0.5,
            blur      : 4,
            quality   : 4,
            offset    : {x:0, y:0},
            // offset    : {x:-4, y:8},
            shadowOnly: true,
        });
        this.dropshadowText.filters = [this.dropShadowFilter];

        /**
         * グロードロップシャドウ
         */
        const glowStyle = Utils.cloneTextStyle(textStyle, {fill: 0xFFFFFF});
        this.glowText = this.addChild(new PIXI.Text(text, glowStyle));
        this.glowFilter = new PIXI.filters.DropShadowFilter({
            color  : 0xFF0000,
            color  : 0xFFFFFF,
            alpha  : 0.9,
            blur   : 4,
            quality: 4,
            offset : {x:0, y:0},
            quality: 4,
            shadowOnly: true,
        });
        this.glowText.filters = [this.glowFilter];

        this.sideFace.zIndex = 10;
        this.frontFace.zIndex = 20;
        this.glowText.zIndex = 21;
        
        Utils.pivotCenter(this);
        this.redraw();
    }
    
    redraw(cameraRadius = 15, cameraAngle = 90, shadowRadius = 50, shadowDegree = 90){
        /**
         * サイドフェイス
         */
        const cameraRadiusPerTick = cameraRadius / this._sideFaceList.length;
        for (let i = 0; i < this._sideFaceList.length; i++) {
            
            const pos = {
                x: (cameraRadiusPerTick * i) * Math.cos(Utils.degreesToRadians(cameraAngle)),
                y: (cameraRadiusPerTick * i) * Math.sin(Utils.degreesToRadians(cameraAngle)),
            };
            
            let side = this._sideFaceList[i];
            side.scale.set(1);
            side.x = pos.x;
            side.y = pos.y;
            const fov = i * 1.5;
            side.width -= fov;
            side.x += (fov) / 2;
            if(i == this._sideFaceList.length - 1){
                this.shadows.y = side.y;
            }
        }

        /**
         * シャドウ
         */
        const shadpwRadiusPerTick = shadowRadius / this._shadowList.length;
        for (let i = 0; i < this._shadowList.length; i++) {
            
            const pos = {
                x: (shadpwRadiusPerTick * i) * Math.cos(Utils.degreesToRadians(shadowDegree)),
                y: (shadpwRadiusPerTick * i) * Math.sin(Utils.degreesToRadians(shadowDegree)),
            }
            
            let shadow = this._shadowList[i];
            shadow.scale.set(1);
            shadow.x = pos.x;
            shadow.y = pos.y;
            const fov = i * 1.5;
            shadow.width -= fov;
            shadow.x += (fov) / 2;
        }

        /**
         * ドロップシャドウ
         */
        const pos = {
            x: (shadowRadius/10) * Math.cos(Utils.degreesToRadians(shadowDegree)),
            y: (shadowRadius/10) * Math.sin(Utils.degreesToRadians(shadowDegree)),
        }
        this.dropShadowFilter.offset = pos;

        /**
         * グロードロップシャドウ
         */
        const glowPos = {
            x: (shadowRadius/5) * Math.cos(Utils.degreesToRadians(Utils.getOppositeDegrees(shadowDegree))),
            y: (shadowRadius/5) * Math.sin(Utils.degreesToRadians(Utils.getOppositeDegrees(shadowDegree))),
        }
        this.glowFilter.offset = glowPos;
    }

}