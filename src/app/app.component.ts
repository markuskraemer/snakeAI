import { Game } from './game/Game';
import { AISnake } from './game/AISnake';
import { SimulationService } from './game/simulation.service';
import { DialogService } from './ui/dialogs/dialog.service';
import { TickService } from './tick.service';
import { ConfigService } from './config.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

    public showGenerations:boolean = true;
    public showHallOfFame:boolean = true;
    public inspectedGame:Game;
    private _useFastMode:boolean;

    constructor(
        public simulation:SimulationService,
        public configService:ConfigService,
        public tickService:TickService,
        public dialogService:DialogService
    ){
        simulation.start ();
        tickService.start ();
    }

    public getInfo ():void {
    }

    public set useFastMode (value:boolean){
        if(this._useFastMode != value){
            this._useFastMode = value;

            if(this._useFastMode){
                this.tickService.speed = 40;
                this.tickService.loopsPerTick = 100;
            }else{
                this.tickService.speed = 15;
                this.tickService.loopsPerTick = 1;                
            }
        }
    }

    public get useFastMode (){
        return this._useFastMode;
    }

}
