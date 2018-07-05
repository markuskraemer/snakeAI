import { MathUtils } from './../utils/MathUtils';
import { Direction } from './../model/Direction.enum';
import { NeuralNetwork } from './../network/NeuralNetwork';
import { Alias } from './../Alias';
import { XY } from './../model/XY';
import { Snake } from './Snake';

enum NeuronNames {
    TopClear = 'TopClear',
    BottomClear = 'BottomClear',
    RightClear = 'RightClear',
    LeftClear = 'LeftClear',
    FoodVertical = 'FoodVertical',
    FoodHorizontal = 'FoodHorizontal',
    MoveHorizontal = 'MoveHorizontal',
    MoveVertical = 'MoveVertical',
}


export class AISnake2Outputs extends Snake {

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

    public clone ():AISnake2Outputs {
        return AISnake2Outputs.fromJSON(this.toJSON());
    }

    public toJSON ():any {
        let { brain, ticks, id, bodyParts } = this;
        return {brain, ticks, id, bodyParts};
    }

    public static fromJSON (json:JSON):AISnake2Outputs {
        const snake:AISnake2Outputs = new AISnake2Outputs (false);
        const jsonBodyParts:{x:number, y:number}[] = json['bodyParts']; 
        
        jsonBodyParts.forEach ((value:{x:number, y:number}, index:number) => {
            snake.bodyParts[index] = new XY (value.x, value.y);
        });

        snake.ticks = json['ticks'];
        snake.id = json['id'];

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

    public getMutatedClone ():AISnake2Outputs {
        const myClone:AISnake2Outputs = new AISnake2Outputs ();
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
        this.brain = new NeuralNetwork (6, hiddenLayerLength, 2);
        this.brain.inputLayer[0].name = NeuronNames.TopClear;
        this.brain.inputLayer[1].name = NeuronNames.BottomClear;
        this.brain.inputLayer[2].name = NeuronNames.RightClear;
        this.brain.inputLayer[3].name = NeuronNames.LeftClear;

        this.brain.inputLayer[4].name = NeuronNames.FoodVertical;
        this.brain.inputLayer[5].name = NeuronNames.FoodHorizontal;

        this.brain.outputLayer[0].name = NeuronNames.MoveHorizontal;
        this.brain.outputLayer[1].name = NeuronNames.MoveVertical;

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
        const horizontalOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveHorizontal).output;
        const verticalOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveVertical).output;
        this.setDir (horizontalOutput, verticalOutput);
    }

    private setDir (horizontalOutput:number, verticalOutput:number){
        if(horizontalOutput == 0 && verticalOutput == 0){
            return;
        }
        if(Math.abs(horizontalOutput) > Math.abs(verticalOutput)) {
            if(horizontalOutput > 0){
                if(this.direction != Direction.Left)
                    this.direction = Direction.Right;
                else
                    this.setDir(0, verticalOutput);
            }else{
                if(this.direction != Direction.Right)
                    this.direction = Direction.Left;
                else
                    this.setDir(0, verticalOutput);

            }
        }else{
            if(verticalOutput > 0){
                if(this.direction != Direction.Up)
                    this.direction = Direction.Down;
                else
                    this.setDir(horizontalOutput, 0);

            }else{
                if(this.direction != Direction.Down)
                    this.direction = Direction.Up;
                else
                    this.setDir(horizontalOutput, 0);

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

            const topIsClear:boolean = this.isClear (headPos.x, headPos.y - 1);
            const bottomIsClear:boolean = this.isClear (headPos.x, headPos.y + 1);
            const rightIsClear:boolean = this.isClear (headPos.x + 1, headPos.y);
            const leftIsClear:boolean = this.isClear (headPos.x - 1, headPos.y);

            this.brain.getInputNeuronFromName (NeuronNames.TopClear).input = topIsClear ? 1 : 0;
            this.brain.getInputNeuronFromName (NeuronNames.BottomClear).input = bottomIsClear ? 1 : 0;
            this.brain.getInputNeuronFromName (NeuronNames.RightClear).input = rightIsClear ? 1 : 0;
            this.brain.getInputNeuronFromName (NeuronNames.LeftClear).input = leftIsClear ? 1 : 0;
        }else{
            this.brain.getInputNeuronFromName (NeuronNames.TopClear).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BottomClear).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.RightClear).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.LeftClear).input = 0;
        }

        // food
        if(this._foodNeuronsEnabled){

            const distFoodVertical:number = foodPos.y - headPos.y;
            const distFoodHorizontal:number = foodPos.x - headPos.x;

            this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = this.minus1_0_1(distFoodVertical);
            this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = this.minus1_0_1(distFoodHorizontal);
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
