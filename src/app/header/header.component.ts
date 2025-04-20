import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  ngAfterViewInit() {
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');
  
    menuBtn?.addEventListener('click', () => sideMenu?.classList.add('show'));
    closeBtn?.addEventListener('click', () => sideMenu?.classList.remove('show'));
  }
  
}
