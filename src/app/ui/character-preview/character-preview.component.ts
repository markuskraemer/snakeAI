import { AISnake } from './../../game/AISnake';

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-character-preview',
  templateUrl: './character-preview.component.html',
  styleUrls: ['./character-preview.component.scss']
})
export class CharacterPreviewComponent implements OnInit {

    @Input ('character')
    public character:AISnake;    

    constructor() { }

    ngOnInit() {
    }

}
