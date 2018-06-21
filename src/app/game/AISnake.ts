
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
    FoodTop = 'FoodTop',
    FoodBottom = 'FoodBottom',
    FoodRight = 'FoodRight',
    FoodLeft = 'FoodLeft',
    BodyTop = 'BodyTop',
    BodyBottom = 'BodyBottom',
    BodyRight = 'BodyRight',
    BodyLeft = 'BodyLeft'
}


export class AISnake extends Snake {

    public brain:NeuralNetwork;

    constructor (){       
        super ();
        this.createBrain ();
        this.synchronizeWeights ();
    }

    private createBrain ():void {
        this.brain = new NeuralNetwork (12, 2);
        this.brain.inputLayer[0].name = NeuronNames.BorderTop;
        this.brain.inputLayer[1].name = NeuronNames.BorderBottom;
        this.brain.inputLayer[2].name = NeuronNames.BorderRight;
        this.brain.inputLayer[3].name = NeuronNames.BorderLeft;

        this.brain.inputLayer[4].name = NeuronNames.FoodTop;
        this.brain.inputLayer[5].name = NeuronNames.FoodBottom;
        this.brain.inputLayer[6].name = NeuronNames.FoodLeft;
        this.brain.inputLayer[7].name = NeuronNames.FoodRight;

        this.brain.inputLayer[8].name = NeuronNames.BodyTop;
        this.brain.inputLayer[9].name = NeuronNames.BodyBottom;
        this.brain.inputLayer[10].name = NeuronNames.BodyLeft;
        this.brain.inputLayer[11].name = NeuronNames.BodyRight;


        this.brain.outputLayer[0].name = NeuronNames.MoveHorizontal;
        this.brain.outputLayer[1].name = NeuronNames.MoveVertical;

        this.brain.randomizeWeights ();

    }

    private synchronizeWeights ():void {
        this.brain.setConnectionWeight (1, 1, 1, -this.brain.getConnectionWeight(1, 1, 0));
        this.brain.setConnectionWeight (1, 1, 3, -this.brain.getConnectionWeight(1, 1, 2));

        this.brain.setConnectionWeight (1, 0, 1, -this.brain.getConnectionWeight(1, 0, 0));
        this.brain.setConnectionWeight (1, 0, 3, -this.brain.getConnectionWeight(1, 0, 2));

        this.brain.setConnectionWeight (1, 1, 5, -this.brain.getConnectionWeight(1, 1, 4));
        this.brain.setConnectionWeight (1, 1, 7, -this.brain.getConnectionWeight(1, 1, 6));

        this.brain.setConnectionWeight (1, 0, 5, -this.brain.getConnectionWeight(1, 0, 4));
        this.brain.setConnectionWeight (1, 0, 7, -this.brain.getConnectionWeight(1, 0, 6));

        this.brain.setConnectionWeight (1, 1, 9, -this.brain.getConnectionWeight(1, 1, 8));
        this.brain.setConnectionWeight (1, 1, 11, -this.brain.getConnectionWeight(1, 1, 10));

        this.brain.setConnectionWeight (1, 0, 9, -this.brain.getConnectionWeight(1, 0, 8));
        this.brain.setConnectionWeight (1, 0, 11, -this.brain.getConnectionWeight(1, 0, 10));
    }

    public clone ():AISnake {
        const myClone:AISnake = new AISnake ();
        myClone.bodyParts.length = Alias.configService.snakeStartLength;
        myClone.brain.copyWeightsFrom (this.brain);
        myClone.brain.randomizeAnyConnection (.1);
        myClone.synchronizeWeights ();
        myClone.color = this.color - 0x111111;
        if(myClone.color < 0)
            myClone.color += 0xffffff;
        return myClone;

    }

    public tick ():void {
        this.updateInput ();
        this.determineDir ();
        super.tick ();
        this.checkNoFoodPeriod ();
        this.updateInput ();
    }

    private checkNoFoodPeriod ():void {
        if(this.noFoodTicks > 100){
            Alias.gameService.snakeDead ();
        }
    }

    private determineDir ():void {
        const horizontalOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveHorizontal).output;
        const verticalOutput:number = this.brain.getOutputNeuronFromName (NeuronNames.MoveVertical).output;
        if(Math.abs(horizontalOutput) > Math.abs(verticalOutput)) {
            if(horizontalOutput > 0){
                if(this.direction != Direction.Left)
                    this.direction = Direction.Right;
            }else{
                if(this.direction != Direction.Right)
                    this.direction = Direction.Left;
            }
        }else{
            if(verticalOutput > 0){
                if(this.direction != Direction.Up)
                    this.direction = Direction.Down;
            }else{
                if(this.direction != Direction.Down)
                    this.direction = Direction.Up;
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
        const distFoodT:number = headPos.y - foodPos.y;
        const distFoodB:number = foodPos.y - headPos.y;
        const distFoodR:number = foodPos.x - headPos.x;
        const distFoodL:number = headPos.x - foodPos.x;

        this.brain.getInputNeuronFromName (NeuronNames.FoodTop).input = MathUtils.sigmoid(distFoodT);
        this.brain.getInputNeuronFromName (NeuronNames.FoodBottom).input = MathUtils.sigmoid(distFoodB);
        this.brain.getInputNeuronFromName (NeuronNames.FoodRight).input = MathUtils.sigmoid(distFoodR);
        this.brain.getInputNeuronFromName (NeuronNames.FoodLeft).input = MathUtils.sigmoid(distFoodL);


        // body  --> TODO: gucken, ob funktioniert !
        const distBodyT:number = this.getClosestDistBodyPartVertical (headPos, true);
        const distBodyB:number = this.getClosestDistBodyPartVertical (headPos, false);
        const distBodyR:number = this.getClosestDistBodyPartHorizontal (headPos, false);
        const distBodyL:number = this.getClosestDistBodyPartHorizontal (headPos, true);


        this.brain.getInputNeuronFromName (NeuronNames.BodyTop).input = MathUtils.sigmoid(distBodyT);
        this.brain.getInputNeuronFromName (NeuronNames.BodyBottom).input = MathUtils.sigmoid(distBodyB);
        this.brain.getInputNeuronFromName (NeuronNames.BodyRight).input = MathUtils.sigmoid(distBodyR);
        this.brain.getInputNeuronFromName (NeuronNames.BodyLeft).input = MathUtils.sigmoid(distBodyL);

/*
        this.brain.getInputNeuronFromName (NeuronNames.BodyTop).input = (distBodyT);
        this.brain.getInputNeuronFromName (NeuronNames.BodyBottom).input = (distBodyB);
        this.brain.getInputNeuronFromName (NeuronNames.BodyRight).input = (distBodyR);
        this.brain.getInputNeuronFromName (NeuronNames.BodyLeft).input = (distBodyL);
*/

    }

    private getClosestDistBodyPartHorizontal (headPos:XY, isLeft:boolean):number {
        const bodyPartsOnRow:XY[] = this.getBodyPartsOnRow (headPos.y);
        let closestDist:number = Alias.gameService.width + 2;
        for(let bodyPart of bodyPartsOnRow){
            if(isLeft && (bodyPart.x < headPos.x)){
                if(Math.abs(headPos.x - bodyPart.x) < closestDist){
                    closestDist = Math.abs(headPos.x - bodyPart.x);
                }
            }else if(!isLeft && (bodyPart.x > headPos.x)){
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
            if(isTop && (bodyPart.y < headPos.y)){
                if(Math.abs(headPos.y - bodyPart.y) < closestDist){
                    closestDist = Math.abs(headPos.y - bodyPart.y);
                }
            }else if(!isTop && (bodyPart.y > headPos.y){
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
