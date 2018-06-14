import { TickService } from './../../tick.service';
import { MathUtils } from './../../utils/MathUtils';
import { Connection } from './../../network/Connection';
import { WorkingNeuron } from './../../network/WorkingNeuron';
import { NeuralNetwork } from './../../network/NeuralNetwork';
import { Neuron } from './../../network/Neuron';
import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-neuralNetwork',
  templateUrl: './neuralNetwork.component.html',
  styleUrls: ['./neuralNetwork.component.css']
})
export class NeuralNetworkComponent implements OnInit {

    @Input('network')
    public set network (n:NeuralNetwork) {
        this._network = n;
        // this.infoConnections.length = 0;
        this.determineContext ();
        requestAnimationFrame ( () => this.draw ());
        this.draw (); 
    }

    public get network ():NeuralNetwork {
        return this._network;
    }

    @ViewChild ('canvas')
    public canvas:ElementRef;

    private infoConnectionNames:string [] = [];
    private marginTopBottom:number = 20;
    private marginLeftRight:number = 40;
    
    private context:CanvasRenderingContext2D;
    private width:number;
    private height:number;
    private radius:number;
    private _network:NeuralNetwork;

    constructor(
        private elementRef:ElementRef,
        private tickService:TickService
    ) { }

    ngOnInit() {
        this.determineContext ();
        this.tickService.tick.subscribe ( () => this.draw ());
        this.draw ();
    }

    private determineContext (){
        const canvas:HTMLCanvasElement = this.canvas.nativeElement;
        this.context = canvas.getContext ('2d');        
    }


    public get canvasWidth ():number {
        return this.elementRef.nativeElement.clientWidth;
    }

    public get canvasHeight ():number {
        return this.elementRef.nativeElement.clientHeight;
    }


    private draw ():void {
        this.radius = 10;
        this.width = this.context.canvas.width;
        this.height = this.context.canvas.height;
        this.context.clearRect (0, 0, this.width, this.height);
        
        if(this._network){
            this.context.lineWidth = 1;
            this.context.strokeStyle = 'black';
            this.drawNeurons ();
            this.drawConnections ();
            //this.drawValueIndicators ();
        }
    }

    // this is a test func
    private drawSquare ():void {
        this.context.strokeStyle = 'red';
        this.context.strokeRect (10,10,200,100);
    }


    private drawNeurons ():void {
        for(let layerIndex:number = 0; layerIndex < this._network.layers.length; ++layerIndex){
            const layer:Neuron[] = this._network.layers[layerIndex];
            for(let i:number = 0; i < layer.length; ++i){
                this.drawNeuron (layerIndex, i);
            }
        }
    }

    private drawNeuron (layerIndex:number, neuronIndex:number):void {
        const neuron:Neuron = this._network.layers[layerIndex][neuronIndex];
        const x:number = this.getNeuronX(layerIndex);
        const y:number = this.getNeuronY(layerIndex, neuronIndex);
        this.context.beginPath();
        this.context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
        this.context.stroke();
        this.context.font = '10px Arial';
        this.context.lineWidth = 1;
        this.context.strokeText (neuron.name || neuron.id, x + this.radius + 10, y + 5);

        this.context.lineWidth = .5;
        this.context.strokeText (String(MathUtils.round3 (neuron.output)), x + this.radius + 10, y + 22); 
    }


    private drawConnections ():void {
        for(let layerIndex:number = 1; layerIndex < this._network.layers.length; ++layerIndex){
            const layer:Neuron[] = this._network.layers[layerIndex];
            for(let i:number = 0; i < layer.length; ++i){
                this.drawConnectionsOfNeuron (layerIndex, i);
            }
        }
    }

    private drawConnectionsOfNeuron (layerIndex:number, neuronIndex:number):void {
        const neuron:WorkingNeuron = <WorkingNeuron> this._network.layers[layerIndex][neuronIndex];
        for(let j:number = 0; j < neuron.connections.length; ++j){
            const connection:Connection = neuron.connections[j];
            const startX:number = this.getNeuronX (layerIndex);
            const startY:number = this.getNeuronY (layerIndex, neuronIndex);
                
            const endX:number = this.getNeuronX (layerIndex-1);
            const endY:number = this.getNeuronY (layerIndex-1, j);

            const drawInfo:boolean = this.infoConnectionNames.indexOf (connection.id) >= 0; 

            this.context.lineWidth = drawInfo ? 3 : 1;
        
            this.context.strokeStyle = this.getColor (connection.weight);
            this.context.beginPath ();
            this.context.moveTo (endX, endY);
            this.context.lineTo (startX, startY);
            this.context.stroke ();

            if(drawInfo){
                this.context.lineWidth = .5;
                this.context.strokeStyle = 'black';
                this.context.fillStyle = 'white';
                this.context.fillRect (startX + (endX - startX) / 2 - 5, 
                                    startY + (endY - startY) / 2 - 20,
                                    35,
                                    20);
                this.context.strokeText (String(MathUtils.round3(connection.weight)), 
                                            startX + (endX - startX) / 2, 
                                            startY + (endY - startY) / 2 - 5);
            }        
        }
    }

    private drawValueIndicators ():void {
        for(let layerIndex:number = 0; layerIndex < this._network.layers.length; ++layerIndex){
            const layer:Neuron[] = this._network.layers[layerIndex];
            for(let i:number = 0; i < layer.length; ++i){
                this.drawValueOfNeuron (layerIndex, i);
            }
        }        
    }

    private drawValueOfNeuron (layerIndex:number, neuronIndex:number):void {
        const neuron:Neuron = this._network.layers[layerIndex][neuronIndex];
        const x:number = this.getNeuronX(layerIndex);
        const y:number = this.getNeuronY(layerIndex, neuronIndex);

        this.context.beginPath();
        this.context.fillStyle = this.getColor (neuron.output);
        this.context.arc(x, y, Math.abs(neuron.output) * this.radius, 0, 2 * Math.PI, false);
        this.context.fill();
    }

 

    private getColor (n:number):string {

        if(n < 0){
            return 'rgb(' + n * -255 + ',0,0)';
        }else{
            return 'rgb(0,' + n * 255 + ',0)';
        }
    }


    private getNeuronX (layerIndex:number):number {
        const offset:number = (this.width - this.radius*2 - this.marginLeftRight*2) / (this._network.layers.length-1);  
        return offset * layerIndex + this.radius;// + this.marginLeftRight;
    }

    private getNeuronY (layerIndex:number, neuronIndex:number):number {
        const neuronCount:number = this._network.layers[layerIndex].length;
        const offset:number = (this.height - this.radius*2 - this.marginTopBottom*2) / (neuronCount-1);  
        return offset * neuronIndex + this.radius + this.marginTopBottom;
    }

    public handleClick (event:MouseEvent):void {
        const neuron:WorkingNeuron = this.getOutputNeuronUnderPoint (event.offsetX, event.offsetY);
        
        if(neuron != null){
            for(const connection of neuron.connections){
                this.showConnectionInfo (connection.id);
            }
        }else{
            const connection:Connection = this.getConnetionUnderPoint (event.offsetX, event.offsetY);
            if(connection != null){
                this.showConnectionInfo (connection.id);
            }else{
                this.hideAllConnectionInfos ();                
            }
        }
        this.draw ();
    }


    private getConnetionUnderPoint (x:number, y:number):Connection {
        
        for(let layerIndex:number = 1; layerIndex < this._network.layers.length; ++layerIndex){
            const layer:Neuron[] = this._network.layers[layerIndex];
            for(let neuronIndex:number = 0; neuronIndex < layer.length; ++neuronIndex){
                const connectionUnderPoint:Connection = this.checkConnectionOfNeuronUnderPoint(layerIndex, neuronIndex, x, y);
                if(connectionUnderPoint)
                    return connectionUnderPoint;
            }
        }
        return null;
    }

    private checkConnectionOfNeuronUnderPoint (layerIndex:number, neuronIndex:number, x:number, y:number):Connection{

        const endX:number = this.getNeuronX(layerIndex);
        const endY:number = this.getNeuronY(layerIndex, neuronIndex);

        const neuron:WorkingNeuron = <WorkingNeuron> this._network.layers[layerIndex][neuronIndex];

        for(let connIndex:number = 0; connIndex < neuron.connections.length; ++connIndex){
            const startX:number = this.getNeuronX(layerIndex-1);
            const startY:number = this.getNeuronY(layerIndex-1, connIndex);

            const isOnLine:boolean = MathUtils.pointIsOnLine (endX, endY, startX, startY, x, y, .5);

            if(isOnLine){
                console.log (x, x, isOnLine);
                return neuron.connections[connIndex];
            }
        }
    }


    private getOutputNeuronUnderPoint (x:number, y:number):WorkingNeuron {
        for(let layerIndex:number = 1; layerIndex < this._network.layers.length; ++layerIndex){
            const layer:Neuron[] = this._network.layers[layerIndex];
            for(let neuronIndex:number = 0; neuronIndex < layer.length; ++neuronIndex){
                const neuronUnderPoint:WorkingNeuron = <WorkingNeuron> this.checkNeuronUnderPoint(layerIndex, neuronIndex, x, y);
                if(neuronUnderPoint)
                    return neuronUnderPoint;
            }
        }
        return null;
    }

    private checkNeuronUnderPoint(layerIndex:number, neuronIndex:number, x, y):Neuron {
        if(MathUtils.distance (this.getNeuronX (layerIndex), this.getNeuronY(layerIndex, neuronIndex), x, y) < this.radius){
            return this._network.layers[layerIndex][neuronIndex];
        }
        return null;
    }


    private showConnectionInfo (connectionName:string):void {
        console.log("connectionInfo: ", connectionName);
        if(this.infoConnectionNames.indexOf(connectionName) == -1){
            this.infoConnectionNames.push(connectionName);
        }
    }

    private hideAllConnectionInfos ():void {
        console.log("hideAllConnectionInfos");
        this.infoConnectionNames.length = 0;
    }
}
