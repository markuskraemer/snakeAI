import { GameService } from './../../game/game.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-game-bg',
  templateUrl: './game-bg.component.html',
  styleUrls: ['./game-bg.component.scss']
})
export class GameBackgroudComponent implements OnChanges {
    
    @ViewChild ('canvas')
    public canvas:ElementRef;

    private _width:number = 0;

    @Input('width')
    public set width(value:number){
        this._width = value;
    }

    public get width ():number{
        return this._width;
    }

    @Input('height')
    public height:number;

    @Input('tileSize')
    public tileSize:number;


    public canvasWidth:number;
    public canvasHeight:number;

    constructor(
        private elementRef:ElementRef,
        public gameService:GameService
    ) { 
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.canvasWidth = this.width * this.tileSize;
        this.canvasHeight = this.height * this.tileSize;
       
        console.log("gameBg onchnaged: ", changes, " _ " + this.canvasWidth + " | " + this.canvasHeight);
        requestAnimationFrame ( () => this.draw ());
    }

    private draw ():void {
        let context:CanvasRenderingContext2D = this.canvas.nativeElement.getContext ('2d'); 
        context.clearRect (0, 0, this.canvasWidth, this.canvasHeight);
        for(let i:number = 0; i < this.width; ++i){
            for(let j:number = 0; j < this.height; ++j){
                context.strokeStyle = 'white';
                context.lineWidth = .5;
                context.fillStyle = 'black';
                context.fillRect (i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);                
                context.strokeRect (i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);                
            }
        }
    }

}
