import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { MAT_KEYBOARD_LAYOUTS, IKeyboardLayouts, keyboardLayouts, MatKeyboardModule } from 'angular-onscreen-material-keyboard';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { AppComponent } from './app/app.component';

const customLayouts: IKeyboardLayouts = {
  ...keyboardLayouts,
  'Tolles Layout': {
    'name': 'Awesome layout',
    'keys': [
      [
        ['1', '!'],
        ['2', '@'],
        ['3', '#']
      ]
    ],
    'lang': ['de-CH']
  }
};



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
        // Angular modules
        BrowserModule, FormsModule, ReactiveFormsModule, 
        // Material modules
        MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatTabsModule, MatKeyboardModule),
        { provide: MAT_KEYBOARD_LAYOUTS, useValue: customLayouts },
        provideAnimations()
    ]
});
