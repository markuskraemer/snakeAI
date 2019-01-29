import { XY } from './../model/XY';
import { Direction } from './../model/Direction.enum';
import { NeuralNet } from './../neuralnet/NeuralNet';
import { Alias } from './../Alias';
import { Snake } from './Snake';


export class TfSnake extends Snake {

    public static fromJSON (json):TfSnake {
        return null;    
    }

    private output:any [];
    public brain:NeuralNet;
    public killedBecauseOfCircularMotion:boolean;
    
    constructor (selfInit:boolean = true){       
        super ();
        if(selfInit) {
            this.createBrain (Alias.configService.hiddenNeurons);
        }
    }


    public toJSON ():any {

    }


    public clone ():TfSnake {
        const clonie:TfSnake = new TfSnake (false);
        clonie.brain = this.brain.clone ();
        return clonie;
    }

    public getMutatedClone ():TfSnake {
        const clonie:TfSnake = this.clone ();
        clonie.bodyParts.length = Alias.configService.snakeStartLength;
        clonie.ticks = 0;
        clonie.brain.mutate (Alias.configService.mutationRate);
        return clonie;
    }

    private createBrain (hiddenLayerLength:number):void {
        this.brain = new NeuralNet ([5, hiddenLayerLength, 3]);
    }


    public setToGameStartValues ():void {
        this.bodyParts.length = Alias.configService.snakeStartLength;
        this.ticks = 0;
        this.direction = Direction.Up;
        this.noFoodTicks = 0;
    }

    public tick ():void {
        this.updateInput ();
        this.determineDir ();
        super.tick ();

        this.checkNoFoodPeriod ();
        // this.updateInput ();
    }

    private checkNoFoodPeriod ():void {
        if(this.noFoodTicks > 300) {
            this.killedBecauseOfCircularMotion = true;
            this.game.snakeDead ();
        }
    }

    private getHighestindex (a:any[]):number {
        let highest:number = Number.MIN_SAFE_INTEGER;
        let highestIndex:number = -1;
        for(let i:number = 0; i < a.length; ++i){
            if(a[i] > highest){
                highest = a[i];
                highestIndex = i;
            }
        }
        return highestIndex;
    }

    private determineDir ():void {
        const highestIndex:number = this.getHighestindex (this.output);
        //console.log('determineDir output: ', this.output, ' hi: ', highestIndex);
        switch(highestIndex) {
            case 0: // left:
                switch(this.direction) {
                    case Direction.Left:
                        this.direction = Direction.Down;
                        break;

                    case Direction.Up:
                        this.direction = Direction.Left;
                        break;

                    case Direction.Right:
                        this.direction = Direction.Up;
                        break;

                    case Direction.Down:
                        this.direction = Direction.Right;
                        break;

                }
                break;
            case 1: // up:
                // direction wird nicht verändert.
                break;
            case 2: // right:
                switch(this.direction) {
                    case Direction.Left:
                        this.direction = Direction.Up;
                        break;

                    case Direction.Up:
                        this.direction = Direction.Right;
                        break;

                    case Direction.Right:
                        this.direction = Direction.Down;
                        break;

                    case Direction.Down:
                        this.direction = Direction.Left;
                        break;

                }
                break;

        }

    }


    private isClear (x:number, y:number):boolean{
        if(x < 0 || x >= this.game.width) return false;
        if(y < 0 || y >= this.game.height) return false;
        let bodyTest:boolean = true;
        this.bodyParts.forEach ((part:XY) => { 
            if(part.x == x && part.y == y){ 
                bodyTest =  false;
            }
        });
        return bodyTest;
    }


    private updateInput ():void {
        const headPos:XY = this.bodyParts[0];
        const foodPos:XY = this.game.foodPos;
        let input:number[];

        const topIsClear:number = this.isClear (headPos.x, headPos.y - 1) ? 1 : 0;
        const bottomIsClear:number = this.isClear (headPos.x, headPos.y + 1) ? 1 : 0;
        const rightIsClear:number = this.isClear (headPos.x + 1, headPos.y) ? 1 : 0;
        const leftIsClear:number = this.isClear (headPos.x - 1, headPos.y) ? 1 : 0;

        const distFoodHorizontal:number = foodPos.x - headPos.x;
        const distFoodVertical:number = foodPos.y - headPos.y;


        switch(this.direction){
            case Direction.Up:
                input = [leftIsClear, topIsClear, rightIsClear];
                input = input.concat (distFoodHorizontal, distFoodVertical);
                break;

            case Direction.Left:
                input = [bottomIsClear, leftIsClear, topIsClear];
                input = input.concat (- distFoodVertical, distFoodHorizontal);
                break;

            case Direction.Down:
                input = [rightIsClear, bottomIsClear, leftIsClear];
                input = input.concat (-distFoodHorizontal, -distFoodVertical);
                break;

            case Direction.Right:
                input = [topIsClear, rightIsClear, bottomIsClear];
                input = input.concat (distFoodVertical, -distFoodHorizontal);
                break;
        }

        this.output = this.brain.predict (input);
        // console.log('updateInput: ' , input, " -> ", this.output);

    }    
}