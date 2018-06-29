import { SimulationService } from './game/simulation.service';
import { ConnectionsInfoComponent } from './components/connections-info/connections-info.component';
import { CharacterPreviewComponent } from './ui/character-preview/character-preview.component';
import { CharactersStorageListComponent } from './ui/characters-storage-list/characters-storage-list.component';
import { DialogService } from './ui/dialogs/dialog.service';
import { DialogsComponent } from './ui/dialogs/dialogs.component';
import { NeuralNetworkComponent } from './components/neuralNetwork/neuralNetwork.component';
import { GameForegroundComponent } from './components/game-fg/game-fg.component';
import { StorageService } from './storage/storage.service';
import { ConfigService } from './config.service';
import { TickService } from './tick.service';
import { KeyboardService } from './game/Keyboard.service';
import { GameBackgroudComponent } from './components/game-bg/game-bg.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
    GameBackgroudComponent,
    GameForegroundComponent,
    NeuralNetworkComponent,
    DialogsComponent,
    CharactersStorageListComponent,
    CharacterPreviewComponent,
    ConnectionsInfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
      KeyboardService,
      TickService,
      ConfigService,
      StorageService,
      DialogService,
      SimulationService,
      FormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
