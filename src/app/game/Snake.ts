import { Direction } from './../model/Direction.enum';
import { XY } from './../model/XY';
import { Key } from 'ts-keycode-enum';
import { Alias } from './../Alias';
export class Snake {

    public bodyParts:XY [] = [];
    public direction:Direction = Direction.Right;
    public hasEaten:boolean;
    public isDead:boolean;

    constructor (){
        this.bodyParts = [new XY (), new XY (), new XY()];
        Alias.keyboardService.mapDown (Key.W, () => { if(this.direction != Direction.Down) this.direction = Direction.Up });
        Alias.keyboardService.mapDown (Key.D, () => { if(this.direction != Direction.Left) this.direction = Direction.Right });
        Alias.keyboardService.mapDown (Key.A, () => { if(this.direction != Direction.Right) this.direction = Direction.Left });
        Alias.keyboardService.mapDown (Key.S, () => { if(this.direction != Direction.Up) this.direction = Direction.Down });
    }

    public destroy ():void {
        Alias.keyboardService.unmapDown (Key.W);
        Alias.keyboardService.unmapDown (Key.D);
        Alias.keyboardService.unmapDown (Key.A);
        Alias.keyboardService.unmapDown (Key.S);
        
    }

    public setHeadPosition (pos:XY) {
        this.bodyParts[0] = new XY (pos.x, pos.y);
        for(let i:number = 1; i < Alias.configService.snakeStartLength; ++i){
            this.bodyParts[i] = new XY (pos.x - i, pos.y);
        }
    }


    public tick () {
        const newPos:XY = this.moveHead ();
        if(this.headIsOnMap (newPos)){
            this.checkEat (newPos);
            this.updateBodyParts (newPos);

            if(this.findIndexInBody (this.bodyParts[0]) > 0){
                this.isDead = true;
                Alias.gameService.snakeCollision ();                
            }
        }else{
            this.isDead = true;
            Alias.gameService.snakeCollision ();
        }       
    }

    private headIsOnMap (headPos:XY):boolean {
        if(headPos.x < 0 || headPos.x >= Alias.gameService.width || headPos.y < 0 || headPos.y >= Alias.gameService.height){
            console.log("bumm!!" + headPos);
            return false;
        }
        return true;
    }

    public findIndexInBody (pos:XY):number {

        for(let i:number = 1; i < this.bodyParts.length; ++i){
            if(this.bodyParts[i].equals(pos))
                return i;
        }
        return -1;
    }

    public snakeContainsPos (pos:XY):boolean {
        return this.bodyParts.find ((value:XY) => {
            return value.x == pos.x && value.y == pos.y;
        }) != null;
    }

    private checkEat (headPos:XY):void {
        if(headPos.equals(Alias.gameService.foodPos)){
            this.hasEaten = true;
            Alias.gameService.eatFood ();
        }else{
            this.hasEaten = false;
        }
    }



    private moveHead ():XY {
        let result:XY = this.bodyParts[0].clone ();
        let newX:number;
        let newY:number;
        switch(this.direction){
            case Direction.Up:
                newY  = this.bodyParts[0].y - 1;
                result.y = newY;    
                break;
            
            case Direction.Down:
                newY = this.bodyParts[0].y + 1;
                result.y = newY;    
                break;

            case Direction.Left:
                newX = this.bodyParts[0].x - 1;
                result.x = newX;    
                break;

            case Direction.Right:
                newX = this.bodyParts[0].x + 1;
                result.x = newX;    
                break;
        }
        return result;
    }

    private updateBodyParts (headPos:XY):void {

        if(this.hasEaten){
            this.bodyParts.push (this.bodyParts[this.bodyParts.length-1]);
        }
        for(let i:number = this.bodyParts.length-1; i > 0; --i){
            this.bodyParts[i] = this.bodyParts[i-1];
        }
        this.bodyParts[0] = headPos;
    }

}
