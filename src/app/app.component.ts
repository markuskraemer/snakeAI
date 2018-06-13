import { ConfigService } from './config.service';
import { GameService } from './game/game.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
 
    constructor(
        public gameService:GameService,
        public configService:ConfigService
    ){
        
    }

}
