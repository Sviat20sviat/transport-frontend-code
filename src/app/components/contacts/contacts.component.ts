import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'contacts',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {

}
