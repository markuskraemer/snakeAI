import { Connection } from './Connection';


export abstract class Neuron 
{
    public abstract get input(): number; 
    public bias: number = 0;
    public abstract get output(): number;
    
    public name:string;    

    constructor (public id:string){
        
    }
}