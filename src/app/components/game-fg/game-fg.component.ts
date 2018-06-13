import { Direction } from './../../model/Direction.enum';
import { TickService } from './../../tick.service';
import { XY } from './../../model/XY';
import { Snake } from './../../game/Snake';
import { GameService } from './../../game/game.service';
import { Component, OnInit, ViewChild, Input, ElementRef, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-game-fg',
  templateUrl: './game-fg.component.html',
  styleUrls: ['./game-fg.component.scss']
})
export class GameForegroundComponent implements OnInit {

   @ViewChild ('canvas')
    public canvas:ElementRef;

    @Input('width')
    public width :number;

    @Input('height')
    public height:number;

    @Input('tileSize')
    public tileSize:number;

    @Input('snake')
    public snake:Snake;

    @Input('foodPos')
    public foodPos:XY;



    public canvasWidth:number;
    public canvasHeight:number;

    constructor(
        private elementRef:ElementRef,
        public gameService:GameService,
        private tickSevice:TickService
    ) { 
    }

    ngOnInit ():void {
        this.tickSevice.draw.subscribe ( () => this.draw ());
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.canvasWidth = this.width * this.tileSize;
        this.canvasHeight = this.height * this.tileSize;
       
        requestAnimationFrame ( () => this.draw ());
    }

    private draw ():void {
        let context:CanvasRenderingContext2D = this.canvas.nativeElement.getContext ('2d'); 
        context.clearRect (0, 0, this.canvasWidth, this.canvasHeight);
        
        this.drawFood (context);
        this.drawSnake (context);

    }

    private drawFood (context:CanvasRenderingContext2D):void {
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.fillStyle = 'red';
        context.fillRect (this.foodPos.x * this.tileSize, this.foodPos.y * this.tileSize, this.tileSize, this.tileSize);   
        context.strokeRect (this.foodPos.x * this.tileSize, this.foodPos.y * this.tileSize, this.tileSize, this.tileSize);           
    }

    private drawSnake (context:CanvasRenderingContext2D):void {

        for(let i:number = this.snake.bodyParts.length-1; i >= 0; --i){
            const xy:XY = this.snake.bodyParts[i];
            const xPos:number = xy.x * this.tileSize;
            const yPos:number = xy.y * this.tileSize;

            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.fillStyle = 'white';
            context.fillRect (xPos, yPos, this.tileSize, this.tileSize);   
            context.strokeRect (xPos, yPos, this.tileSize, this.tileSize);   
            
            if(i == 0){
                if(this.snake.isDead) {
                    this.drawDeadFace (context);
                }else{
                    this.drawFace (context);
                }   
            }
        }
    }

    private drawFace (context:CanvasRenderingContext2D):void {
        const xPos:number = this.snake.bodyParts[0].x * this.tileSize;
        const yPos:number = this.snake.bodyParts[0].y * this.tileSize;
        context.fillStyle = 'black';
        context.fillRect (xPos + this.tileSize * .2, yPos + this.tileSize * .2, this.tileSize/10, this.tileSize/10);   
        context.fillRect (xPos + this.tileSize * .7, yPos + this.tileSize * .2, this.tileSize/10, this.tileSize/10);
        switch(this.snake.direction){
            
            case Direction.Right:
                context.fillRect (xPos + this.tileSize * .3, yPos + this.tileSize * .5, this.tileSize*.7, this.tileSize*.2);
                break;

            case Direction.Left:
                context.fillRect (xPos + this.tileSize * .0, yPos + this.tileSize * .5, this.tileSize*.7, this.tileSize*.2);
                break;

            case Direction.Up:
            case Direction.Down:
                context.fillRect (xPos + this.tileSize * .2, yPos + this.tileSize * .5, this.tileSize*.6, this.tileSize*.2);
                break;
        }

    }

    private drawDeadFace (context:CanvasRenderingContext2D):void {
        const xPos:number = this.snake.bodyParts[0].x * this.tileSize;
        const yPos:number = this.snake.bodyParts[0].y * this.tileSize;
        context.fillStyle = 'black';
        context.fillRect (xPos + this.tileSize * .3, yPos + this.tileSize * .2, this.tileSize/10, this.tileSize/10);   
        context.fillRect (xPos + this.tileSize * .6, yPos + this.tileSize * .2, this.tileSize/10, this.tileSize/10);

        context.fillRect (xPos + this.tileSize * .3, yPos + this.tileSize * .5, this.tileSize*.4, this.tileSize*.1);
        context.fillRect (xPos + this.tileSize * .3, yPos + this.tileSize * .6, this.tileSize*.1, this.tileSize*.15);
        context.fillRect (xPos + this.tileSize * .6, yPos + this.tileSize * .6, this.tileSize*.1, this.tileSize*.15);
    }


}
