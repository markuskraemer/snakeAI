import { StorageService } from './../../storage/storage.service';
import { DialogService } from './dialog.service';

import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.css']
})
export class DialogsComponent implements OnInit {

    @ViewChild ('storageListModal')
    public storageListModal:ElementRef;


    constructor(
        public dialogService:DialogService,
        public storageService:StorageService
    ) { 
        this.dialogService.changed.subscribe (() => {
            
           // this.ngbActiveModal.close ();
            switch(this.dialogService.state){
                case DialogService.SHOW_STORAGE_LIST:
                    //this.ngbActiveModal.close ();
                    break;
            }
        })

    }

    ngOnInit() {
    }

}
