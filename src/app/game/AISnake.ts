import { MathUtils } from './../utils/MathUtils';
import { Direction } from './../model/Direction.enum';
import { NeuralNetwork } from './../network/NeuralNetwork';
import { Alias } from './../Alias';
import { XY } from './../model/XY';
import { Snake } from './Snake';

enum NeuronNames {
    TopClear = 'TopClear',
    RightClear = 'RightClear',
    LeftClear = 'LeftClear',
    FoodVertical = 'FoodVertical',
    FoodHorizontal = 'FoodHorizontal',
    MoveLeft = 'MoveLeft',
    MoveRight = 'MoveRight',
    MoveForeward = 'MoveForeward'
}


export class AISnake extends Snake {

    public brain:NeuralNetwork;
    public killedBecauseOfCircularMotion:boolean;
    private _borderNeuronsEnabled:boolean = true;
    private _foodNeuronsEnabled:boolean = true;
    private _bodyNeuronsEnabled:boolean = true;

    public set bodyNeuronsEnabled (value:boolean){
        if(this._bodyNeuronsEnabled != value){
            this._bodyNeuronsEnabled = value;
            this.updateInput ();
        }
    }

    public get bodyNeuronsEnabled ():boolean{
        return this._bodyNeuronsEnabled;
    }

    public set foodNeuronsEnabled (value:boolean){
        if(this._foodNeuronsEnabled != value){
            this._foodNeuronsEnabled = value;
            this.updateInput ();
        }
    }

    public get foodNeuronsEnabled ():boolean{
        return this._foodNeuronsEnabled;
    }

    public set borderNeuronsEnabled (value:boolean){
        if(this._borderNeuronsEnabled != value){
            this._borderNeuronsEnabled = value;
            this.updateInput ();
        }
    }

    public get borderNeuronsEnabled ():boolean {
        return this._borderNeuronsEnabled;
    }

    public clone ():AISnake {
        return AISnake.fromJSON(this.toJSON());
    }

    public toJSON ():any {
        let { brain, ticks, id, bodyParts, color } = this;
        return {brain, ticks, id, bodyParts, color};
    }

    public static fromJSON (json:JSON):AISnake {
        const snake:AISnake = new AISnake (false);
        const jsonBodyParts:{x:number, y:number}[] = json['bodyParts']; 
        
        jsonBodyParts.forEach ((value:{x:number, y:number}, index:number) => {
            snake.bodyParts[index] = new XY (value.x, value.y);
        });

        snake.ticks = json['ticks'];
        snake.id = json['id'];
        snake.color = json['color'] || 0xffff00;
        const layers:any[] = json['brain']._layers;
        if(layers.length == 2){
            snake.createBrain (0);
        }else if(layers.length == 3){
            snake.createBrain (layers[1].length);
        }

        snake.brain.copyWeightsFrom (json['brain']);

        return snake;
    }

    constructor (selfInit:boolean = true){       
        super ();
        if(selfInit){
            this.createBrain (Alias.configService.hiddenNeurons);
           // this.synchronizeWeights ();
        }
    }

    public setToGameStartValues ():void {
        this.bodyParts.length = Alias.configService.snakeStartLength;
        this.ticks = 0;
        this.direction = Direction.Right;
        this.noFoodTicks = 0;
    }

    public getMutatedClone ():AISnake {
        const myClone:AISnake = new AISnake ();
        myClone.bodyParts.length = Alias.configService.snakeStartLength;
        myClone.ticks = 0;
        myClone.brain.copyWeightsFrom (this.brain);
        myClone.brain.randomizeAnyConnection (Alias.configService.mutationRate);
       // myClone.synchronizeWeights ();
        myClone.color = this.color - 0x111122;
        if(myClone.color < 0)
            myClone.color += 0xffffff;
        return myClone;

    }

    private createBrain (hiddenLayerLength:number):void {
        this.brain = new NeuralNetwork (5, hiddenLayerLength, 3);
        this.brain.inputLayer[0].name = NeuronNames.TopClear;
        this.brain.inputLayer[1].name = NeuronNames.RightClear;
        this.brain.inputLayer[2].name = NeuronNames.LeftClear;

        this.brain.inputLayer[3].name = NeuronNames.FoodVertical;
        this.brain.inputLayer[4].name = NeuronNames.FoodHorizontal;

        this.brain.outputLayer[0].name = NeuronNames.MoveLeft;
        this.brain.outputLayer[1].name = NeuronNames.MoveRight;
        this.brain.outputLayer[2].name = NeuronNames.MoveForeward;

        this.brain.randomizeWeights ();

    }

    protected synchronizeWeights ():void {

        const weightBorderHor:number = this.brain.getConnectionWeight(1, 0, 0);
        const weightBorderVert:number = this.brain.getConnectionWeight(1, 0, 2);

        for(let i:number = 0; i < this.brain.hiddenLayer.length; ++i){
            if(i % 2 == 0){
                this.brain.setConnectionWeight (1, i, 0, weightBorderHor);
                this.brain.setConnectionWeight (1, i, 1, weightBorderHor);
                this.brain.setConnectionWeight (1, i, 2, weightBorderVert);
                this.brain.setConnectionWeight (1, i, 3, weightBorderVert);
            }else{
                this.brain.setConnectionWeight (1, i, 0, weightBorderVert);
                this.brain.setConnectionWeight (1, i, 1, weightBorderVert);
                this.brain.setConnectionWeight (1, i, 2, weightBorderHor);
                this.brain.setConnectionWeight (1, i, 3, weightBorderHor);
            }
        }

        const weightFoodHor:number = this.brain.getConnectionWeight(1, 0, 4);
        const weightFoodVert:number = 1 - weightFoodHor;
        for(let i:number = 0; i < this.brain.hiddenLayer.length; ++i){
            if(i % 2 == 0){
                this.brain.setConnectionWeight (1, i, 4, weightFoodHor);
                this.brain.setConnectionWeight (1, i, 5, weightFoodVert);
           }else{
                this.brain.setConnectionWeight (1, i, 4, weightFoodVert);
                this.brain.setConnectionWeight (1, i, 5, weightFoodHor);
           }
        }

     
    }

    public tick ():void {
        this.updateInput ();
        this.determineDir ();
        super.tick ();
        if(!this._foodNeuronsEnabled){
            this.noFoodTicks = 0;
        }
        this.checkNoFoodPeriod ();
        this.updateInput ();
    }

    private checkNoFoodPeriod ():void {
        if(this.noFoodTicks > 100) {
            this.killedBecauseOfCircularMotion = true;
            this.game.snakeDead ();
        }
    }

    private determineDir ():void {
        const leftOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveLeft).output;
        const rightOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveRight).output;
        const forewardOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveForeward).output;
        this.setDir (leftOutput, rightOutput, forewardOutput);
    }

    private setDir (leftOutput:number, rightOutput:number, forewardOutput:number){
        
        if(forewardOutput > leftOutput && forewardOutput > rightOutput){
            return;
        }

        if(leftOutput > rightOutput){
            switch(this.direction){
                case Direction.Up:  this.direction = Direction.Left; break;
                case Direction.Left:  this.direction = Direction.Down; break;
                case Direction.Down:  this.direction = Direction.Right; break;
                case Direction.Right:  this.direction = Direction.Up; break;
            }
        }else{
            switch(this.direction){
                case Direction.Up:  this.direction = Direction.Right; break;
                case Direction.Left:  this.direction = Direction.Up; break;
                case Direction.Down:  this.direction = Direction.Left; break;
                case Direction.Right:  this.direction = Direction.Down; break;
            }
        }
    }



    private calc (n:number):number {
        return n / this.game.width;
    }

    private minus1_0_1 (n:number):number {
        if(n == 0)  return 0;
        return n / Math.abs(n);
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

        if(headPos.x == 0|| headPos.x == this.game.width-1){
            if(headPos.y == 0 || headPos.y == this.game.height-1){
               // debugger;
            }
        }else if(headPos.y == 0){
            if(headPos.x == 0 || headPos.x == this.game.width-1){
                // debugger;
            }
        }

        const foodPos:XY = this.game.foodPos;

        // border
        if(this._borderNeuronsEnabled){

            const topIsClear:number = this.isClear (headPos.x, headPos.y - 1) ? 1 : 0;
            const bottomIsClear:number = this.isClear (headPos.x, headPos.y + 1) ? 1 : 0;
            const rightIsClear:number = this.isClear (headPos.x + 1, headPos.y) ? 1 : 0;
            const leftIsClear:number = this.isClear (headPos.x - 1, headPos.y) ? 1 : 0;

            switch(this.direction){
                case Direction.Up:
                    this.brain.getInputNeuronFromName (NeuronNames.TopClear).input = topIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.RightClear).input = rightIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.LeftClear).input = leftIsClear;
                    break;

                case Direction.Left:
                    this.brain.getInputNeuronFromName (NeuronNames.TopClear).input = leftIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.RightClear).input = topIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.LeftClear).input = bottomIsClear;
                    break;

                case Direction.Down:
                    this.brain.getInputNeuronFromName (NeuronNames.TopClear).input = bottomIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.RightClear).input = leftIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.LeftClear).input = rightIsClear;
                    break;

                case Direction.Right:
                    this.brain.getInputNeuronFromName (NeuronNames.TopClear).input = rightIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.RightClear).input = bottomIsClear;
                    this.brain.getInputNeuronFromName (NeuronNames.LeftClear).input = topIsClear;
                    break;

            }

        }else {
            this.brain.getInputNeuronFromName (NeuronNames.TopClear).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.RightClear).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.LeftClear).input = 0;
        }

        // food
        if(this._foodNeuronsEnabled){

            const distFoodVertical:number = this.minus1_0_1(foodPos.y - headPos.y);
            const distFoodHorizontal:number = this.minus1_0_1(foodPos.x - headPos.x);

            switch(this.direction){
                case Direction.Up:
                    this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = this.minus1_0_1(distFoodVertical);
                    this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = this.minus1_0_1(distFoodHorizontal);
                    break;

                case Direction.Down:
                    this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = - this.minus1_0_1(distFoodVertical);
                    this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = - this.minus1_0_1(distFoodHorizontal);
                    break;

                case Direction.Left:
                    this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = this.minus1_0_1(distFoodHorizontal);
                    this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = -this.minus1_0_1(distFoodVertical);
                    break;

                case Direction.Right:
                    this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = -this.minus1_0_1(distFoodHorizontal);
                    this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = this.minus1_0_1(distFoodVertical);
                    break;

            }


        }else{
            this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = 0;
        }
    }

    private getClosestDistBodyPartHorizontal (headPos:XY, isLeft:boolean):number {
        const bodyPartsOnRow:XY[] = this.getBodyPartsOnRow (headPos.y);
        let closestDist:number = isLeft ? - this.game.width - 2 : this.game.width + 2;
        for(let bodyPart of bodyPartsOnRow){
            if((isLeft && (bodyPart.x < headPos.x)) || (!isLeft && (bodyPart.x > headPos.x))){
                if(Math.abs(bodyPart.x - headPos.x) < Math.abs(closestDist)){
                    closestDist = bodyPart.x - headPos.x;
                }
            }
        }
        return closestDist;
    }

    private getClosestDistBodyPartVertical (headPos:XY, isTop:boolean):number {
        const bodyPartsOnCol:XY[] = this.getBodyPartsOnCol (headPos.x);
        let closestDist:number = isTop ? - this.game.height - 2 : this.game.height + 2;
        for(let bodyPart of bodyPartsOnCol){
            if((isTop && (bodyPart.y < headPos.y)) || (!isTop && (bodyPart.y > headPos.y))) {
                if(Math.abs(bodyPart.y - headPos.y) < Math.abs(closestDist)){
                    closestDist = bodyPart.y - headPos.y;
                }
            }
        }
        return closestDist;
    }

    private getBodyPartsOnRow (row:number):XY[]{
        return this.bodyParts.filter ((value:XY, index:number) => { return index > 0 && value.y == row }); 
    }

    private getBodyPartsOnCol (col:number):XY[]{
        return this.bodyParts.filter ((value:XY, index:number) => { return index > 0 && value.x == col }); 
    }

}
