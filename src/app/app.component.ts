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
    public inspectedGame:Game;

    constructor(
        public simulation:SimulationService,
        public configService:ConfigService,
        public tickService:TickService,
        public dialogService:DialogService
    ){
        simulation.runFirstOrStoredGeneration ();
        tickService.start ();
    }

    public getInfo ():void {
    }

}
