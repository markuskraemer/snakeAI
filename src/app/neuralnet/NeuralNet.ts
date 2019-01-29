import { Alias } from './../Alias';
import * as tf from '@tensorflow/tfjs';


export class NeuralNet {

    private connectionLayers:tf.Tensor[] = [];

    public static createOnes (neurons:number[]):NeuralNet {
        const instance:NeuralNet = new NeuralNet (neurons);
        for(let i:number = 0; i < neurons.length - 1; ++i) {
            instance.connectionLayers[i] = tf.ones ([neurons[i], neurons[i+1]]);
        }
        return instance;
    }

    public static createRandom (neurons:number[]):NeuralNet {
        const instance:NeuralNet = new NeuralNet (neurons);
        for(let i:number = 0; i < neurons.length - 1; ++i) {
            const layer = tf.randomNormal ([neurons[i], neurons[i+1]]);
            instance.connectionLayers[i] = layer;
        }
        return instance;
    }

    constructor (private neurons:number[]){
        //console.log('new Brain: ', neurons);
         for(let i:number = 0; i < neurons.length - 1; ++i) {
            const layer = tf.randomNormal ([neurons[i], neurons[i+1]]);
            this.connectionLayers[i] = layer;
            //layer.print();
        }
    }

    public toString ():string {
        let result:string = '';
        result = '[NeuralNet]';
        this.connectionLayers.map ((layer:tf.Tensor) => {
            result += '\n   ' + layer.shape + ' data: ' + layer.dataSync ();
        });
        return result;
    }

    public clone ():NeuralNet {
        const clonie:NeuralNet = new NeuralNet (this.neurons.concat ());
        clonie.dispose ();

        clonie.connectionLayers = this.connectionLayers.map ((layer:tf.Tensor) => tf.clone (layer));
        return clonie;
    }

    public makeChildWith (other:NeuralNet):NeuralNet {
        const child:NeuralNet = new NeuralNet (this.neurons);
        let cnt:number = 0;
        for(let i:number = 0; i < this.connectionLayers.length; ++i){
            const myLayer:tf.Tensor = this.connectionLayers[i];
            const otherLayer:tf.Tensor = other.connectionLayers[i];
            if(cnt++%2==0){
                child.connectionLayers[i] = myLayer.clone ();
            }else{
                child.connectionLayers[i] = otherLayer.clone ();                
            }
        }
        return child;
    }

    public mutate (mutationRate:number, times:number = 1):void {
        while(times-- > 0){
            this.mutateOneWeight (mutationRate);
        }
    }

    private mutateOneWeight (mutationRate:number):void {
        const rndLayerIndex:number = Math.floor(Math.random () * this.connectionLayers.length);
        // this.connectionLayers[rndLayerIndex].print ();
        const mutation:number = mutationRate * Math.random () - mutationRate/2;
        
        const layer:tf.Tensor = this.connectionLayers[rndLayerIndex];

        const buffer = tf.buffer (layer.shape, layer.dtype, layer.dataSync ());

        const rndCol:number = Math.floor(Math.random () * layer.shape[0]);            
        const rndRow:number = Math.floor(Math.random () * layer.shape[1]);

        const currentValue:number = <number> buffer.get (rndCol, rndRow);
        /*
        console.log('indicies: ' + rndLayerIndex + '|' + rndCol + '|' + rndRow);
        console.log(' oldValue: ' + currentValue);
        console.log(' newValue: ' + (currentValue+ mutation));
        */
        buffer.set (currentValue + mutation, rndCol, rndRow);
        layer.dispose ();
        this.connectionLayers[rndLayerIndex] = buffer.toTensor ();
        // this.connectionLayers[rndLayerIndex].print ();
    }

    public dispose ():void {
        this.connectionLayers.forEach((tensor:tf.Tensor) => tensor.dispose ());
    }


    public predict (input):any[] {
        let output;

        tf.tidy (() => {

            let layer = tf.tensor (input, [1, this.neurons[0]]);
            for(let i:number = 0; i < this.connectionLayers.length; ++i) {
                layer = layer.matMul (this.connectionLayers[i]).sigmoid ();
            }
            output = layer.dataSync ();
        })
        return output;
    }

}