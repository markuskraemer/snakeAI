import { Neuron } from './Neuron';

export class Connection
{
    public weight: number = 6.66;
    public newWeight: number;
    public id: string;
    public fromNeuron:Neuron;
    
    public static fromJSON (json:any):Connection {
        const connection:Connection = new Connection ();
        connection.weight = json['weight'];
        connection.id = json['id'];
        return connection;
    }
    
    constructor(){

    }

    public updateWeight(): void
    {
        this.weight = this.newWeight;
    }

    public toJSON ():any {
        let { weight, id } = this;
        return { weight, id };
    }
}