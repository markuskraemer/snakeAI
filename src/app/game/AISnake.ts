import { MathUtils } from './../utils/MathUtils';
import { Direction } from './../model/Direction.enum';
import { NeuralNetwork } from './../network/NeuralNetwork';
import { Alias } from './../Alias';
import { XY } from './../model/XY';
import { Snake } from './Snake';

enum NeuronNames {
    BorderTop = 'BorderTop',
    BorderBottom = 'BorderBottom',
    BorderRight = 'BorderRight',
    BorderLeft = 'BorderLeft',
    MoveHorizontal = 'MoveHorizontal',
    MoveVertical = 'MoveVertical',
    FoodVertical = 'FoodVertical',
    FoodHorizontal = 'FoodHorizontal',
    BodyTop = 'BodyTop',
    BodyBottom = 'BodyBottom',
    BodyRight = 'BodyRight',
    BodyLeft = 'BodyLeft'
}


export class AISnake extends Snake {

    public brain:NeuralNetwork;
    public killedBecauseOfCircularMotion:boolean;
    private _borderNeuronsEnabled:boolean = false;
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

    public static fromJSON (json:JSON):AISnake {
        const snake:AISnake = new AISnake (false);
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
            this.synchronizeWeights ();
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
        myClone.brain.randomizeAnyConnection (.2);
        myClone.synchronizeWeights ();
        myClone.color = this.color - 0x111122;
        if(myClone.color < 0)
            myClone.color += 0xffffff;
        return myClone;

    }

    private createBrain (hiddenLayerLength:number):void {
        this.brain = new NeuralNetwork (10, hiddenLayerLength, 2);
        this.brain.inputLayer[0].name = NeuronNames.BorderTop;
        this.brain.inputLayer[1].name = NeuronNames.BorderBottom;
        this.brain.inputLayer[2].name = NeuronNames.BorderRight;
        this.brain.inputLayer[3].name = NeuronNames.BorderLeft;

        this.brain.inputLayer[4].name = NeuronNames.FoodVertical;
        this.brain.inputLayer[5].name = NeuronNames.FoodHorizontal;

        this.brain.inputLayer[6].name = NeuronNames.BodyTop;
        this.brain.inputLayer[7].name = NeuronNames.BodyBottom;
        this.brain.inputLayer[8].name = NeuronNames.BodyLeft;
        this.brain.inputLayer[9].name = NeuronNames.BodyRight;


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

        const weightBodyHor:number = this.brain.getConnectionWeight(1, 0, 6);
        const weightBodyVert:number = this.brain.getConnectionWeight(1, 0, 8);

        for(let i:number = 0; i < this.brain.hiddenLayer.length; ++i){
            if(i % 2 == 0){
                this.brain.setConnectionWeight (1, i, 6, weightBodyHor);
                this.brain.setConnectionWeight (1, i, 7, weightBodyHor);
                this.brain.setConnectionWeight (1, i, 8, weightBodyVert);
                this.brain.setConnectionWeight (1, i, 9, weightBodyVert);
            }else{
                this.brain.setConnectionWeight (1, i, 6, weightBodyVert);
                this.brain.setConnectionWeight (1, i, 7, weightBodyVert);
                this.brain.setConnectionWeight (1, i, 8, weightBodyHor);
                this.brain.setConnectionWeight (1, i, 9, weightBodyHor);                
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
            Alias.gameService.snakeDead ();
        }
    }

    private determineDir ():void {
        const horizontalOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveHorizontal).output;
        const verticalOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveVertical).output;
        this.setDir (horizontalOutput, verticalOutput);
    }

    private setDir (horizontalOutput:number, verticalOutput:number){
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

    private updateInput ():void {
        const headPos:XY = this.bodyParts[0];

        if(headPos.x == 0|| headPos.x == Alias.gameService.width-1){
            if(headPos.y == 0 || headPos.y == Alias.gameService.height-1){
               // debugger;
            }
        }else if(headPos.y == 0){
            if(headPos.x == 0 || headPos.x == Alias.gameService.width-1){
                // debugger;
            }
        }


        const foodPos:XY = Alias.gameService.foodPos;

        // border
        if(this._borderNeuronsEnabled){

            const distBorderT:number = - headPos.y - 1;
            const distBorderB:number = Alias.gameService.height - headPos.y;
            const distBorderR:number = Alias.gameService.width - headPos.x;
            const distBorderL:number = - headPos.x - 1;

            this.brain.getInputNeuronFromName (NeuronNames.BorderTop).input = MathUtils.sigmoidNegPos(distBorderT);
            this.brain.getInputNeuronFromName (NeuronNames.BorderBottom).input = MathUtils.sigmoidNegPos(distBorderB);
            this.brain.getInputNeuronFromName (NeuronNames.BorderRight).input = MathUtils.sigmoidNegPos(distBorderR);
            this.brain.getInputNeuronFromName (NeuronNames.BorderLeft).input = MathUtils.sigmoidNegPos(distBorderL);
        }else{
            this.brain.getInputNeuronFromName (NeuronNames.BorderTop).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BorderBottom).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BorderRight).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BorderLeft).input = 0;
        }

        // food
        if(this._foodNeuronsEnabled){

            const distFoodVertical:number = foodPos.y - headPos.y;
            const distFoodHorizontal:number = foodPos.x - headPos.x;

            this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = MathUtils.sigmoidNegPos(distFoodVertical);
            this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = MathUtils.sigmoidNegPos(distFoodHorizontal);
        }else{
            this.brain.getInputNeuronFromName (NeuronNames.FoodVertical).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.FoodHorizontal).input = 0;
        }

        // body 
        if(this._bodyNeuronsEnabled){

            const distBodyT:number = this.getClosestDistBodyPartVertical (headPos, true);
            const distBodyB:number = this.getClosestDistBodyPartVertical (headPos, false);
            const distBodyR:number = this.getClosestDistBodyPartHorizontal (headPos, false);
            const distBodyL:number = this.getClosestDistBodyPartHorizontal (headPos, true);

            
            this.brain.getInputNeuronFromName (NeuronNames.BodyTop).input = MathUtils.sigmoidNegPos(distBodyT);
            this.brain.getInputNeuronFromName (NeuronNames.BodyBottom).input = MathUtils.sigmoidNegPos(distBodyB);
            this.brain.getInputNeuronFromName (NeuronNames.BodyRight).input = MathUtils.sigmoidNegPos(distBodyR);
            this.brain.getInputNeuronFromName (NeuronNames.BodyLeft).input = MathUtils.sigmoidNegPos(distBodyL);
        
        }else{
            this.brain.getInputNeuronFromName (NeuronNames.BodyTop).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BodyBottom).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BodyRight).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BodyLeft).input = 0;
        }
    }

    private getClosestDistBodyPartHorizontal (headPos:XY, isLeft:boolean):number {
        const bodyPartsOnRow:XY[] = this.getBodyPartsOnRow (headPos.y);
        let closestDist:number = isLeft ? - Alias.gameService.width - 2 : Alias.gameService.width + 2;
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
        let closestDist:number = isTop ? - Alias.gameService.height - 2 : Alias.gameService.height + 2;
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
