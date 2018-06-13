import { NeuralNetwork } from './NeuralNetwork';

fdescribe ('creature test', () => {
    beforeAll (() => {
    })


    it('#network constructor 12', () => {       
        const nn12:NeuralNetwork = new NeuralNetwork (1,2);
 
        expect(nn12.inputLayer.length).toEqual(1);
        expect(nn12.hiddenLayer).toEqual(null);
        expect(nn12.outputLayer.length).toEqual(2);
    })

    it('#network constructor 234', () => {       
        const nn234:NeuralNetwork = new NeuralNetwork (2,3,4);
 
        expect(nn234.inputLayer.length).toEqual(2);
        expect(nn234.hiddenLayer.length).toEqual(3);
        expect(nn234.outputLayer.length).toEqual(4);
    })

    it('#network checkConnections', () => {       
        const nn234:NeuralNetwork = new NeuralNetwork (2,3,4);
 
        expect(nn234.outputLayer[0].connections[1].fromNeuron).toBe(nn234.hiddenLayer[1]);
        expect(nn234.hiddenLayer[0].connections[1].fromNeuron).toBe(nn234.inputLayer[1]);
    })

    it('#network copy from other brain', () => {       
        const nn234:NeuralNetwork = new NeuralNetwork (2,3,4);
        const nn234Copy:NeuralNetwork = new NeuralNetwork (2,3,4);
        nn234Copy.copyWeightsFrom(nn234);
        expect(JSON.stringify(nn234)).toEqual(JSON.stringify(nn234Copy));
    })
  
    it('#network copy from json', () => {       
        const nn234:NeuralNetwork = new NeuralNetwork (2,3,4);
        nn234.randomizeWeights ();

        const nn234Copy:NeuralNetwork = new NeuralNetwork (2,3,4);
        const nn234JSON = JSON.parse(JSON.stringify(nn234));
        nn234Copy.copyWeightsFrom(nn234JSON);
        expect(JSON.stringify(nn234)).toEqual(JSON.stringify(nn234Copy));
        console.log("JSON: ", nn234JSON);
        expect(nn234Copy.outputLayer[0].connections[1].fromNeuron).toBe(nn234Copy.hiddenLayer[1]);

    })


    it('#network synchronized?', () => {       
        const nn234:NeuralNetwork = new NeuralNetwork (2,3,4);
        nn234.randomizeWeights ();

        console.log("synchronized?: ", nn234);
        
        nn234.synchronize(0,0,0,1);
        expect(nn234.hiddenLayer[0].connections[0].weight).toEqual(nn234.hiddenLayer[1].connections[0].weight);
        expect(nn234.hiddenLayer[0].connections[1].weight).toEqual(nn234.hiddenLayer[1].connections[1].weight);

    })

})
