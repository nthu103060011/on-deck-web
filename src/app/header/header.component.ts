import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() dateChanged = new EventEmitter<string>();
  date: string;
  private lastFetchDate = '';

  constructor() {
    this.date = new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
  }

  ngOnInit(): void {
    this.dateChanged.emit(this.date);
    this.lastFetchDate = this.date;
  }

  changeDate(): void {
    const date = new Date(this.date).toLocaleDateString('en-US');
    if (this.lastFetchDate !== date) {
      this.lastFetchDate = date;
      this.dateChanged.emit(date);
    }
  }
}
