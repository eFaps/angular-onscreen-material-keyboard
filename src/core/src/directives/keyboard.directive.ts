import { Directive, ElementRef, OnDestroy, inject, input, output } from '@angular/core';
import { NgControl } from '@angular/forms';

import { MatKeyboardRef } from '../classes/keyboard-ref.class';
import { MatKeyboardComponent } from '../components/keyboard/keyboard.component';
import { MatKeyboardService } from '../services/keyboard.service';

@Directive({ selector: 'input[matKeyboard], textarea[matKeyboard]', 
  host: {
    "(focus)" :"onFocus()",
    "(blur)" :"onBlur()"
  }
})
export class MatKeyboardDirective implements OnDestroy {
  private elementRef = inject(ElementRef);
  private keyboardService = inject(MatKeyboardService);
  private control = inject(NgControl, { optional: true, self: true });

  private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;

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
    if (this.keyboardService.enableDirective) {
      this.keyboardRef = this.keyboardService.open(this.matKeyboard(), {
        darkTheme: this.darkTheme(),
        duration: this.duration(),
        isDebug: this.isDebug()
      });

      // reference the input element
      this.keyboardRef.instance.setInputInstance(this.elementRef);

      // set control if given, cast to smth. non-abstract
      if (this.control) {
        this.keyboardRef.instance.attachControl(this.control.control);
      }

      // connect outputs
      this.keyboardRef.instance.enterClick.subscribe(() => this.enterClick.emit());
      this.keyboardRef.instance.capsClick.subscribe(() => this.capsClick.emit());
      this.keyboardRef.instance.altClick.subscribe(() => this.altClick.emit());
      this.keyboardRef.instance.shiftClick.subscribe(() => this.shiftClick.emit());
    }
  }

  public onBlur() {
    if (this.keyboardRef) {
      this.keyboardRef.dismiss();
    }
  }
}
