import { dataProvider, dp } from "./dataProvider.js";
import GraphicsHelper from "./helper/GraphicsHelper.js";
import Utils from "./Utils.js";

export class PseudoText3d extends PIXI.Container {
    
    constructor(text = 'AOOA') {
        super();

        this.shadows = this.addChild(new PIXI.Container());
        this.sideFace = this.addChild(new PIXI.Container());
        
        /**
         * テキストスタイル
         */
        /* ここは引数として受け取った方が良い */
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Inter',
            fontSize  : 300,
            fontWeight: 800,
            // fill      : [0xFF0000],
            fill      : [0xFFFFFF, 0xEFEFEF],
            //    fill             : [0xEFEFEF, 0xE7E0E0],
            //    fill             : [0xE7E0E0, 0xD3CDCD],
            align            : 'center',
            fillGradientType : 0,
            fillGradientStops: [0.3, 0.9, 1],
        });

        const sideStyle = Utils.cloneTextStyle(textStyle, {fill: 0x888888});


        /**
         * フロントフェイスを作成
         */
        const frontFace = new PIXI.Text(text, textStyle);
        this.addChild(frontFace);
        Utils.pivotCenter(this);

        /**
         * サイドフェイスを作成
         */
        const numOfSideLayer = 10;
        this._sideFaceList = [];
        // let lastSide = undefined;
        
        for (let i = 0; i < numOfSideLayer; i++) {
            const side = 
            this._sideFaceList.push(this.sideFace.addChild(new PIXI.Text(text, sideStyle)));
        }
        this.redraw();
    }
    
    redraw(radius = 15, degree = 90){
        const radiusPerTick = radius / this._sideFaceList.length;
        // const sideHeight = 10;

        for (let i = 0; i < this._sideFaceList.length; i++) {
            
            const pos = {
                x: (radiusPerTick * i) * Math.cos(Utils.degreesToRadians(degree)),
                y: (radiusPerTick * i) * Math.sin(Utils.degreesToRadians(degree)),
            }
            
            let side = this._sideFaceList[i];
            side.scale.set(1);
            side.x = pos.x;
            side.y = pos.y;
            const fov = i * 1.5;
            side.width -= fov;
            side.x += (fov)/2;
            
        }
    }

}