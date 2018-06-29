import { IGenerationStatistic } from './../../model/IGenerationStatistic';
import { Component, OnInit, Input, ElementRef, SimpleChanges, DoCheck } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-generations-info',
  templateUrl: './generations-info.component.html',
  styleUrls: ['./generations-info.component.scss']
})
export class GenerationsInfoComponent implements OnInit, DoCheck {

    private chart:Chart;
    private _statistic:any[];
    private _isInited:boolean;
    private _statisticLength:number = -1;

    public canvasWidth:number;
    public canvasHeight:number;


    @Input('statistic')
    public set statistic (data:IGenerationStatistic[]){
        console.log("set statistic: ", data);
        this._statistic = data;
        if(this._isInited) 
            this.draw ();
    }

    public get statistic ():IGenerationStatistic[]{
        return this._statistic;
    }

    constructor(
        private elementRef:ElementRef
    ) { }

    ngOnInit() {
        this.canvasWidth = this.elementRef.nativeElement.clientWidth - 100;
        this.canvasHeight = this.elementRef.nativeElement.clientHeight;
        const canvas = this.elementRef.nativeElement.querySelector ('#statistic-canvas');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;

        requestAnimationFrame(() => {
                this._isInited = true; 
                this.setUpChart ();
                this.draw ();             
        });
    }

    ngDoCheck (){
        if(this._statistic.length != this._statisticLength){
            console.log("new len" , this._statistic);
            if(this._isInited)
                this.draw ();

            this._statisticLength = this._statistic.length;
        }
    }

    private setUpChart(): void {

        if(this.chart)
            this.chart.destroy ();

        var config: Chart.ChartConfiguration = {};
        var options: Chart.ChartOptions = {};
        
        options.title = {
            display: true,
            text: "Generations Statistic"
        };
        options.animation = { duration: 0 };
        options.legend = {
            display:true
        }
        options.elements = {
            point: {
                pointStyle:'circle'
            }
        }

        options.scales = {
            xAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Generations' } }],
            yAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Snake Lengths' } }],

        }
        options.maintainAspectRatio = false;
        options.responsive = true;
        config.type = 'line';

        config.options = options;

        this.chart = new Chart('statistic-canvas', config);
    }

    private createLabels ():string[]{
        return this.statistic.map ((value:IGenerationStatistic, index:number) => { return String(index+1) });
    }

    private getLongest ():number[]{
        return this.statistic.map ((value:IGenerationStatistic) => { return value.longest });
    }

    private getAverage ():number[]{
        return this.statistic.map ((value:IGenerationStatistic) => { return value.average });
    }

    private draw ():void {
        
        const labels:string[] = this.createLabels ();
        const datasets:any[] = [{
                label: 'Max. Snake Length',
                backgroundColor: 'red',
                borderColor: 'red',
                data: this.getLongest (),
                fill: false,
                pointRadius: 2,
                pointHoverRadius: 15,
                showLine: true 
            },
            {
                label: 'Av. Snake Length',
                backgroundColor: 'green',
                borderColor: 'green',
                data: this.getAverage (),
                fill: false,
                pointRadius: 2,
                pointHoverRadius: 15,
                showLine: true 
            }]
        this.chart.data = {labels:labels, datasets:datasets};
        this.chart.update ();

    }

}
