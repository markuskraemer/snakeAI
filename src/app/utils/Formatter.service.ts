import { Injectable } from '@angular/core';

@Injectable()
export class FormatterService {

    constructor() { }

    public digits:number = 3;
    private nDigits:number = Math.pow (10, this.digits);

    public float (f:number):number {
        f *= this.nDigits;
        f |= 0;
        return f / this.nDigits;
    }

    public force2Digits (n:number):string {
        return n < 10 ? '0' + n : '' + n;
    }

    public toDate (timestamp:number):string {
        const date:Date = new Date (timestamp);
        return date.toLocaleString ();
    }

    public toDuration (seconds:number):string {
        const secs:number = seconds % 60;
        const minutes:number = Math.floor(seconds / 60) % 60;
        const hours:number = Math.floor(seconds / 3600);
        return  this.force2Digits (hours) + ":" + this.force2Digits(minutes) + ":" + this.force2Digits(secs);
    }

}