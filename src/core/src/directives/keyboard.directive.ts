import { Directive, ElementRef, OnDestroy, inject, input, output } from '@angular/core';
import { NgControl } from '@angular/forms';

import { MatKeyboardRef } from '../classes/keyboard-ref.class';
import { MatKeyboardComponent } from '../components/keyboard/keyboard.component';
import { MatKeyboardService } from '../services/keyboard.service';

@Directive({ selector: 'input[matKeyboard], textarea[matKeyboard]', 
  host: {
    "(focus)" :"onFocus()",
    "(blur)" :"onBlur()"
  },
  providers: [MatKeyboardService],
})
export class MatKeyboardDirective implements OnDestroy {
  private _elementRef = inject(ElementRef);
  private _keyboardService = inject(MatKeyboardService);
  private _control = inject(NgControl, { optional: true, self: true });


  private _keyboardRef: MatKeyboardRef<MatKeyboardComponent>;

  readonly matKeyboard = input<string>(undefined);

  readonly darkTheme = input<boolean>(undefined);

  readonly duration = input<number>(undefined);

  readonly isDebug = input<boolean>(undefined);

  readonly enterClick = output<void>();

  readonly capsClick = output<void>();

  readonly altClick = output<void>();

  readonly shiftClick = output<void>();

  ngOnDestroy() {
    this.onBlur();
  }

  public onFocus() {
    console.log('focusevent')
    this._keyboardRef = this._keyboardService.open(this.matKeyboard(), {
      darkTheme: this.darkTheme(),
      duration: this.duration(),
      isDebug: this.isDebug()
    });

    // reference the input element
    this._keyboardRef.instance.setInputInstance(this._elementRef);

    // set control if given, cast to smth. non-abstract
    if (this._control) {
      this._keyboardRef.instance.attachControl(this._control.control);
    }

    // connect outputs
    this._keyboardRef.instance.enterClick.subscribe(() => this.enterClick.emit());
    this._keyboardRef.instance.capsClick.subscribe(() => this.capsClick.emit());
    this._keyboardRef.instance.altClick.subscribe(() => this.altClick.emit());
    this._keyboardRef.instance.shiftClick.subscribe(() => this.shiftClick.emit());
  }

  public onBlur() {
     console.log('blurevent')
    if (this._keyboardRef) {
      this._keyboardRef.dismiss();
    }
  }

}
