import { Connection } from './../../network/Connection';
import { WorkingNeuron } from './../../network/WorkingNeuron';
import { AISnake } from './../../game/AISnake';
import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-connections-info',
  templateUrl: './connections-info.component.html',
  styleUrls: ['./connections-info.component.scss']
})
export class ConnectionsInfoComponent implements OnInit {

    private _snake:AISnake;
    private chart:Chart;
    public canvasWidth:number;
    public canvasHeight:number;

    private _type:'input' | 'hidden' = 'hidden';

    public set type (value:any) {
        if(this._type != value){
            this._type = value;
            this.draw ();
        }
    }

    public get type ():any {
        return this._type;
    }

    @Input ('snake')
    public set snake (value:AISnake){
        if(value != this._snake){

            this._snake = value;
            this.setUpChart ();
            this.draw ();

        }
    }

    public get snake ():AISnake {
        return this._snake;
    }

    constructor(
        private elementRef:ElementRef
    ) { }

    ngOnInit() {
        this.canvasWidth = this.elementRef.nativeElement.clientWidth - 100;
        this.canvasHeight = this.elementRef.nativeElement.clientHeight;

        requestAnimationFrame(() => { 
            if(this._snake){
                this.setUpChart ();
                this.draw ();
            } 
        });
    }

    private setUpChart(): void {

        if(this.chart)
            this.chart.destroy ();

        var config: Chart.ChartConfiguration = {};
        var options: Chart.ChartOptions = {};
        
        options.title = {
            display: true,
            text: "Creature: " + this._snake.id + " | " + this._snake.bodyParts.length + " : " + this._snake.ticks
        };
        options.animation = { duration: 0 };
        options.legend = {

        }
        options.scales = {
            xAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Connections' } }],
            yAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Weights' } }],

        }
        options.maintainAspectRatio = false;
        options.responsive = true;
        config.type = 'bar';
        config.options = options;

        this.chart = new Chart('info-canvas', config);

    }

    private getBackgroundColor (index:number):string{
        const a:string[] = [
            'red',
            'green',
            'blue',
            'yellow',
            'pink',
            'purple',
            'orange',
            'grey'
        ]
        return a[index%a.length];
    }


    private getData (layer:WorkingNeuron[]):any[] {
        const result:any[] = [];
        for(let i:number = 0; i < layer.length; ++i){
            const neuron:WorkingNeuron = layer[i];
            for(let j:number = 0; j < neuron.connections.length; ++j){
                result.push(neuron.connections[j].weight);
            }
        }
        return result;
    }

    private getDataSets (layer:WorkingNeuron[]):any[][]{
        const result = [];
        for(let i:number = 0; i < layer.length; ++i){
            const neuron:WorkingNeuron = layer[i];
            result.push(
                {
                    label:neuron.id,
                    backgroundColor:this.getBackgroundColor(i),
                    data:this.getConnectionWeights(neuron.connections)
                });
        }
        return result;
    }

    private getConnectionWeights (connections:Connection[]):number[]{
        const result:number [] = [];
        for(let j:number = 0; j < connections.length; ++j){
            result.push(connections[j].weight);
        }   
        return result;
    }

    private getLabels (layer:WorkingNeuron[]):string[] {
        const result:string[] = [];
        let cnt:number = layer[0].connections.length;
        while(cnt > 0){
            result.push('' + (cnt--));
        }
        return result.reverse ();
    }


    private draw ():void {

        let layer:WorkingNeuron[];
        let label:string; 
        
        if(this._type == 'hidden'){
            label = 'hidden -> output';
            layer = this._snake.brain.outputLayer;
        }else {
            label = 'input -> hidden';
            layer = this._snake.brain.hiddenLayer;
        }
        
        this.chart.data = {
            labels: this.getLabels(layer),
            datasets:this.getDataSets (layer)
            
        }
        this.chart.update();
    }

}
