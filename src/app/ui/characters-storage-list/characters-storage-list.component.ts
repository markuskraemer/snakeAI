import { AISnake } from './../../game/AISnake';

import { StorageService } from './../../storage/storage.service';
import { GameService } from './../../game/game.service';

import { DialogService } from '../dialogs/dialog.service';
import { IStorageDescribtion } from '../../storage/IStorageDescribtion';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/dialog.js';

@Component({
  selector: 'app-characters-storage-list',
  templateUrl: './characters-storage-list.component.html',
  styleUrls: ['./characters-storage-list.component.css']
})
export class CharactersStorageListComponent implements OnInit {

    @Input ('items')
    public items:IStorageDescribtion[];

    @ViewChild ('dialog')
    private dialog:ElementRef;

    constructor(
        private gameService:GameService,
        private storageService:StorageService,
        private dialogService:DialogService
    ) { }

    ngOnInit() {
        $(this.dialog.nativeElement).dialog ({
            close: () => this.dialogService.closeStorageList (),
            width:500
        })
    }

    public handleLoadClick (json:JSON):void {
        this.gameService.startGameWithSnake(this.getCharacter(json));
    }


    public handlePreviewClick (json:JSON) {
       //  this.gameService.inspectedCharacter = this.getCharacter(json);
    }

    public getCharacter (json:JSON){
        return AISnake.fromJSON (json);
    }
}
