import { NeuralNet } from './NeuralNet';

let nnOnes:NeuralNet;
let nnRnd:NeuralNet;

fdescribe ('NeuralNet test', () => {
    beforeAll (() => {
        nnOnes = NeuralNet.createOnes ([4,3,2]); 
        nnRnd = NeuralNet.createRandom ([4,3,2]); 
    })


    it('#networkOnes clone', () => {       
        const clone:NeuralNet = nnOnes.clone (); 
        const input = [1,2,3,4];
        const nnOutput = nnOnes.predict (input);
        const cloneOutput = clone.predict (input);
        console.log(nnOutput);
        expect(nnOutput).toEqual(cloneOutput);
    })

    it('#networkRandom clone', () => {       
        const clone:NeuralNet = nnRnd.clone (); 
        const input = [1,2,3,4];
        const nnOutput = nnRnd.predict (input);
        const cloneOutput = clone.predict (input);
        console.log(nnOutput);
        expect(nnOutput).toEqual(cloneOutput);
    })
/*
    it('#networkRandom mutateOnes', () => {
        const clone:NeuralNet = nnRnd.clone();
       // console.log(' clone: ', clone.toString ());
        clone.mutate (.5);
       // console.log(' mutated clone: ', clone.toString());
        
    })
*/
     it('#networkRandom mutate3Times', () => {
        const clone:NeuralNet = nnRnd.clone();
       // console.log(' clone: ', clone.toString ());
        clone.mutate (.5, 3);
       // console.log(' mutated clone: ', clone.toString());
        
    })

    it('#networkRandom make Child with other nn', () => {
        const child1 = nnOnes.makeChildWith (nnRnd);
        console.log('child1: ' + child1.toString());        

        const child2 = nnRnd.makeChildWith (nnOnes);
        console.log('child2: ' + child2.toString());        

    })
})