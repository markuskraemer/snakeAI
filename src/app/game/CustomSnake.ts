import { AISnake } from './AISnake';

export class CustomSnake extends AISnake {

    constructor (){       
        super ();
        this.setWeights ();
        this.color = 0xffff00;
    }


    private setWeights ():void {

        // border
        this.brain.setConnectionWeight (1, 0, 0, 0.0);
        this.brain.setConnectionWeight (1, 0, 1, 0.0);
        this.brain.setConnectionWeight (1, 0, 2, 0.7001);
        this.brain.setConnectionWeight (1, 0, 3, 0.7);

        this.brain.setConnectionWeight (1, 1, 0, 0.7003);
        this.brain.setConnectionWeight (1, 1, 1, 0.70001);
        this.brain.setConnectionWeight (1, 1, 2, 0.0);
        this.brain.setConnectionWeight (1, 1, 3, 0.0);

        // food
        this.brain.setConnectionWeight (1, 0, 4, 0);
        this.brain.setConnectionWeight (1, 0, 5, 0.1651);
        this.brain.setConnectionWeight (1, 1, 4, 0.165);
        this.brain.setConnectionWeight (1, 1, 5, 0);

        // body
        this.brain.setConnectionWeight (1, 0, 6, 0);
        this.brain.setConnectionWeight (1, 0, 7, 0);
        this.brain.setConnectionWeight (1, 0, 8, 0.8001);
        this.brain.setConnectionWeight (1, 0, 9, 0.8003);

        this.brain.setConnectionWeight (1, 1, 6, 0.8002);
        this.brain.setConnectionWeight (1, 1, 7, 0.8);
        this.brain.setConnectionWeight (1, 1, 8, 0);
        this.brain.setConnectionWeight (1, 1, 9, 0);

       // this.synchronizeWeights ();
    }
/*
    public clone ():CustomSnake { 
        return new CustomSnake ();
    }*/
}
