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
    private _foodNeuronsEnabled:boolean = true;
    private _bodyNeuronsEnabled:boolean = true;

    public set bodyNeuronsEnabled (value:boolean){
        this._bodyNeuronsEnabled = value;
    }

    public get bodyNeuronsEnabled ():boolean{
        return this._bodyNeuronsEnabled;
    }

    public set foodNeuronsEnabled (value:boolean){
        this._foodNeuronsEnabled = value;
    }

    public get foodNeuronsEnabled ():boolean{
        return this._foodNeuronsEnabled;
    }

    public static fromJSON (json:JSON):AISnake {
        const snake:AISnake = new AISnake ();
        //snake.bodyParts.length = json['bodyParts'].length;
        snake.brain.copyWeightsFrom (json['brain']);

        return snake;
    }

    constructor (){       
        super ();
        this.createBrain ();
        this.synchronizeWeights ();
    }

    public clone ():AISnake {
        const myClone:AISnake = new AISnake ();
        myClone.bodyParts.length = Alias.configService.snakeStartLength;
        myClone.brain.copyWeightsFrom (this.brain);
        myClone.brain.randomizeAnyConnection (.1);
        myClone.synchronizeWeights ();
        myClone.color = this.color - 0x111122;
        if(myClone.color < 0)
            myClone.color += 0xffffff;
        return myClone;

    }

    private createBrain ():void {
        this.brain = new NeuralNetwork (10, 2);
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

    private synchronizeWeights ():void {
        this.brain.setConnectionWeight (1, 1, 1, -this.brain.getConnectionWeight(1, 1, 0));
        this.brain.setConnectionWeight (1, 1, 3, -this.brain.getConnectionWeight(1, 1, 2));

        this.brain.setConnectionWeight (1, 0, 1, -this.brain.getConnectionWeight(1, 0, 0));
        this.brain.setConnectionWeight (1, 0, 3, -this.brain.getConnectionWeight(1, 0, 2));

        this.brain.setConnectionWeight (1, 1, 5, this.brain.getConnectionWeight(1, 0, 4));

        this.brain.setConnectionWeight (1, 0, 5, this.brain.getConnectionWeight(1, 1, 4));

        this.brain.setConnectionWeight (1, 1, 7, -this.brain.getConnectionWeight(1, 1, 6));
        this.brain.setConnectionWeight (1, 1, 9, -this.brain.getConnectionWeight(1, 1, 8));

        this.brain.setConnectionWeight (1, 0, 7, -this.brain.getConnectionWeight(1, 0, 6));
        this.brain.setConnectionWeight (1, 0, 9, -this.brain.getConnectionWeight(1, 0, 8));
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
        const foodPos:XY = Alias.gameService.foodPos;

        // border
        const distBorderT:number = headPos.y + 1;
        const distBorderB:number = Alias.gameService.height - headPos.y;
        const distBorderR:number = Alias.gameService.width - headPos.x;
        const distBorderL:number = headPos.x + 1;

        this.brain.getInputNeuronFromName (NeuronNames.BorderTop).input = MathUtils.sigmoid(distBorderT);
        this.brain.getInputNeuronFromName (NeuronNames.BorderBottom).input = MathUtils.sigmoid(distBorderB);
        this.brain.getInputNeuronFromName (NeuronNames.BorderRight).input = MathUtils.sigmoid(distBorderR);
        this.brain.getInputNeuronFromName (NeuronNames.BorderLeft).input = MathUtils.sigmoid(distBorderL);


        // food
        if(this._foodNeuronsEnabled){

            const distFoodVertical:number = headPos.y - foodPos.y;
            const distFoodHorizontal:number = headPos.x - foodPos.x;

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

            
            this.brain.getInputNeuronFromName (NeuronNames.BodyTop).input = MathUtils.sigmoid(distBodyT);
            this.brain.getInputNeuronFromName (NeuronNames.BodyBottom).input = MathUtils.sigmoid(distBodyB);
            this.brain.getInputNeuronFromName (NeuronNames.BodyRight).input = MathUtils.sigmoid(distBodyR);
            this.brain.getInputNeuronFromName (NeuronNames.BodyLeft).input = MathUtils.sigmoid(distBodyL);
        
        }else{
            this.brain.getInputNeuronFromName (NeuronNames.BodyTop).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BodyBottom).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BodyRight).input = 0;
            this.brain.getInputNeuronFromName (NeuronNames.BodyLeft).input = 0;
        }
    }

    private getClosestDistBodyPartHorizontal (headPos:XY, isLeft:boolean):number {
        const bodyPartsOnRow:XY[] = this.getBodyPartsOnRow (headPos.y);
        let closestDist:number = Alias.gameService.width + 2;
        for(let bodyPart of bodyPartsOnRow){
            if((isLeft && (bodyPart.x < headPos.x)) || (!isLeft && (bodyPart.x > headPos.x))){
                if(Math.abs(headPos.x - bodyPart.x) < closestDist){
                    closestDist = Math.abs(headPos.x - bodyPart.x);
                }
            }
        }
        return closestDist;
    }

    private getClosestDistBodyPartVertical (headPos:XY, isTop:boolean):number {
        const bodyPartsOnCol:XY[] = this.getBodyPartsOnCol (headPos.x);
        let closestDist:number = Alias.gameService.height + 2;
        for(let bodyPart of bodyPartsOnCol){
            if((isTop && (bodyPart.y < headPos.y)) || (!isTop && (bodyPart.y > headPos.y))) {
                if(Math.abs(headPos.y - bodyPart.y) < closestDist){
                    closestDist = Math.abs(headPos.y - bodyPart.y);
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
