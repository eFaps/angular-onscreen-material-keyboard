import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule } from 'angular-onscreen-material-keyboard';

import { AppComponent } from './app.component';

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

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular modules
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    // Material modules
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,

    MatKeyboardModule
  ],
  providers: [
    { provide: MAT_KEYBOARD_LAYOUTS, useValue: customLayouts }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
