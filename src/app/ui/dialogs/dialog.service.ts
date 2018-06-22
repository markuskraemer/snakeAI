import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class DialogService {

    public  static readonly IDLE:string = 'IDLE'; 
    public static readonly SHOW_STORAGE_LIST:string = 'SHOW_STORAGE_LIST'; 
    private _state:string = DialogService.IDLE;

    public get state ():string {
        return this._state;
    }

    private setState (value:string){
        this._state = value;
        this.changed.emit ();
    }

    public get storageListOpen ():boolean {
        return this._state == DialogService.SHOW_STORAGE_LIST;        
    }

    public readonly changed:EventEmitter<null> = new EventEmitter ();

    constructor() { }


    public openStorageList ():void {
        this.setState (DialogService.SHOW_STORAGE_LIST);
    }

    public closeStorageList ():void {
        this.setState (DialogService.IDLE);        
    }


}