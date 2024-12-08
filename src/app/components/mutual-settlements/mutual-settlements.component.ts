import { Component } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { AddressesService } from '../../services/api/addresses.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
@Component({
  selector: 'mutual-settlements',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    MatInputModule, FormsModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, FormsModule, ReactiveFormsModule, JsonPipe
  ],
  templateUrl: './mutual-settlements.component.html',
  styleUrl: './mutual-settlements.component.scss'
})
export class MutualSettlementsComponent {

  loaderId = 'mutual-settlements';

  mutualSettlements = [];
  selectedTabIndex = 1;
  range: FormGroup;
  constructor(
    private fb: FormBuilder
  ) {
    this.range = fb.group({
      start: '',
      end: ''
    })
  }

  createSettlement() {

  }

  openSettlementDialog(settlement) {

  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
  }
}
