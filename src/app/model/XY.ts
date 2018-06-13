export class XY {

    constructor (public x:number = 0, public y:number = 0){

    }

    public clone ():XY {
        return new XY (this.x, this.y);
    }

    public equals (other:XY):boolean {
        return this.x == other.x && this.y == other.y;        
    }

    public toString ():string{
        return 'XY: ' + this.x + '|' + this.y;
    }
}
