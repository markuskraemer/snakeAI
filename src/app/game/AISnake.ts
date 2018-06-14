
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
    MoveVertical = 'MoveVertical'
}


export class AISnake extends Snake {

    public brain:NeuralNetwork;

    constructor (){       
        super ();
        this.createBrain ();
        this.synchronizeWeights ();
    }

    private createBrain ():void {
        this.brain = new NeuralNetwork (4, 2);
        this.brain.inputLayer[0].name = NeuronNames.BorderTop;
        this.brain.inputLayer[1].name = NeuronNames.BorderBottom;
        this.brain.inputLayer[2].name = NeuronNames.BorderRight;
        this.brain.inputLayer[3].name = NeuronNames.BorderLeft;

        this.brain.outputLayer[0].name = NeuronNames.MoveHorizontal;
        this.brain.outputLayer[1].name = NeuronNames.MoveVertical;

        this.brain.randomizeWeights ();

    }

    private synchronizeWeights ():void {
        this.brain.setConnectionWeight (1, 1, 1, -this.brain.getConnectionWeight(1,1,0));
        this.brain.setConnectionWeight (1, 1, 3, -this.brain.getConnectionWeight(1, 1, 2));

        this.brain.setConnectionWeight (1, 0, 1, -this.brain.getConnectionWeight(1,0,0));
        this.brain.setConnectionWeight (1, 0, 3, -this.brain.getConnectionWeight(1, 0, 2));

    }

    public clone ():AISnake {
        const myClone:AISnake = new AISnake ();
        myClone.brain.copyWeightsFrom (this.brain);
        myClone.brain.randomizeAnyConnection (.1);
        myClone.synchronizeWeights ();
        return myClone;

    }

    public tick ():void {
        this.updateInput ();
        this.determineDir ();
        super.tick ();
        this.checkNoFoodPeriod ();
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

        const distBorderT:number = headPos.y + 1;
        const distBorderB:number = Alias.gameService.height - headPos.y;
        const distBorderR:number = Alias.gameService.width - headPos.x;
        const distBorderL:number = headPos.x + 1;

        this.brain.getInputNeuronFromName (NeuronNames.BorderTop).input = MathUtils.sigmoid(distBorderT);
        this.brain.getInputNeuronFromName (NeuronNames.BorderBottom).input = MathUtils.sigmoid(distBorderB);
        this.brain.getInputNeuronFromName (NeuronNames.BorderRight).input = MathUtils.sigmoid(distBorderR);
        this.brain.getInputNeuronFromName (NeuronNames.BorderLeft).input = MathUtils.sigmoid(distBorderL);


    }


}
