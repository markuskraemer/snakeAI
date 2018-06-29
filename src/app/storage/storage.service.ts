import { Key } from 'ts-keycode-enum';
import { IStorageDescribtion } from './IStorageDescribtion';
import { IStorable } from './IStorable';
import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {

    private key:string = 'characters';
    private storedList:IStorageDescribtion[];
    private isDirty:boolean;

    constructor() { }

    public load (id:string):any {
        const item = this.getItem(id);
        return item ? item.o : null;        
    }

    private getItem (id:string):any {
        const list = this.getFileList ();
        return list.find ((item) => {
            return item.id == id;
        });        
    }

    private getItemIndex (id:string):number {
        const list = this.getFileList ();
        return list.findIndex ((item) => {
            return item.id == id;
        });        
    }


    public delete (id:string):void {
        const itemIndex:number = this.getItemIndex(id);
        if(itemIndex >= 0){
            const list = this.getFileList ();
            list.splice(itemIndex, 1);
            localStorage.setItem(this.key, JSON.stringify(list));                    
            this.isDirty = true;
        }
    }

    public save (id:string, o:any):void {
        this.delete(id);
        const list = this.getFileList ();
        list.push ({id:id, o:o, time:new Date().getTime()});
        localStorage.setItem(this.key, JSON.stringify(list));
        this.isDirty = true;

    }

    public getFileList ():IStorageDescribtion []{
        if(this.isDirty || this.storedList == null){
            const s = localStorage.getItem(this.key);
            this.storedList = JSON.parse(s) || [];
            this.isDirty = false;
        }
        return this.storedList;
    }
}