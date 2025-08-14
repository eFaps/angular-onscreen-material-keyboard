
import { CommonModule } from '@angular/common';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';

import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { keyboardDeadkeys, MAT_KEYBOARD_DEADKEYS } from './configs/keyboard-deadkey.config';
import { keyboardLayouts, MAT_KEYBOARD_LAYOUTS } from './configs/keyboard-layouts.config';

import { MatKeyboardContainerComponent } from './components/keyboard-container/keyboard-container.component';
import { MatKeyboardKeyComponent } from './components/keyboard-key/keyboard-key.component';
import { MatKeyboardComponent } from './components/keyboard/keyboard.component';
import { MatKeyboardDirective } from './directives/keyboard.directive';

import { MatKeyboardKebabCasePipe } from './pipes/kebab-case.pipe';
import { MatKeyboardService } from './services/keyboard.service';

@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatKeyboardKebabCasePipe,
        MatKeyboardComponent,
        MatKeyboardContainerComponent,
        MatKeyboardKeyComponent,
        MatKeyboardDirective
    ],
    exports: [
        MatKeyboardComponent,
        MatKeyboardContainerComponent,
        MatKeyboardKeyComponent,
        MatKeyboardDirective
    ],
    providers: [
        MatKeyboardService,
        { provide: MAT_KEYBOARD_DEADKEYS, useValue: keyboardDeadkeys },
        { provide: MAT_KEYBOARD_LAYOUTS, useValue: keyboardLayouts },
        provideZonelessChangeDetection(),
    ]
})
export class MatKeyboardModule {}
