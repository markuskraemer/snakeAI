import { NeuralNetworkComponent } from './components/neuralNetwork/neuralNetwork.component';
import { GameForegroundComponent } from './components/game-fg/game-fg.component';
import { StorageService } from './storage/storage.service';
import { ConfigService } from './config.service';
import { TickService } from './tick.service';
import { KeyboardService } from './game/Keyboard.service';
import { GameService } from './game/game.service';
import { GameBackgroudComponent } from './components/game-bg/game-bg.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
    GameBackgroudComponent,
    GameForegroundComponent,
    NeuralNetworkComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
      GameService,
      KeyboardService,
      TickService,
      ConfigService,
      StorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
