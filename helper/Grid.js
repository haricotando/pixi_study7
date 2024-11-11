export class Grid extends PIXI.Container {

    constructor(gridSize, alignCenter = false){
        super();
        this.lineColor = 'red';
        this.alignCenter = alignCenter === false ? false : true;
        //default = true;
        this.drawGrid(gridSize);
    }

    /* ------------------------------------------------------------
        Grid引く
    ------------------------------------------------------------ */
    drawGrid(gridSize){
        let gridContainer = new PIXI.Sprite();
        const _gridSize = gridSize ? gridSize : 200;
        const numOfLoops = Math.ceil(window.innerHeight/_gridSize);

        this._gridLine(gridContainer, 'v', 0, this.lineColor, 4);
        this._gridLine(gridContainer, 'h', 0, this.lineColor, 4);
        for(let i=1; i<numOfLoops; i++){
            this._gridLine(gridContainer, 'v', _gridSize * i, this.lineColor);
            this._gridLine(gridContainer, 'v', 0-_gridSize * i, this.lineColor);
            this._gridLine(gridContainer, 'h', _gridSize * i, this.lineColor);
            this._gridLine(gridContainer, 'h', 0-_gridSize * i, this.lineColor);
        }
        if(this.alignCenter){
            this.x = window.innerWidth / 2;
            this.y = window.innerHeight / 2;
        }
        this.addChild(gridContainer);
    }

    _gridLine(container, vh, offsetPos, color, lineWidth, lineLength){
        let offsetLen = 0;
        let line = new PIXI.Graphics();
        line.lineStyle(
            lineWidth ? lineWidth : 2, 
            color ? color : 'red'
        );
        let val = lineLength ? lineLength : (vh == 'v' ? window.innerWidth*2 : window.innerHeight*2);
        let v = vh == 'v' ? val-offsetLen : 0;
        let h = vh == 'h' ? val-offsetLen : 0;
        line.moveTo(0-v/2, 0-h/2);
        line.lineTo(v/2, h/2);
        if(offsetPos){
            switch(vh){
                case 'v':
                    line.y += offsetPos;
                    break;
                case 'h':
                    line.x += offsetPos;
                    break;
                default:
            }
        }
        container.addChild(line);
        return line;
    }
}