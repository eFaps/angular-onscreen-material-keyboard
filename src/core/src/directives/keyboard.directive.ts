import { Directive, ElementRef, EventEmitter, HostListener, OnDestroy, Output, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

import { MatKeyboardRef } from '../classes/keyboard-ref.class';
import { MatKeyboardComponent } from '../components/keyboard/keyboard.component';
import { MatKeyboardService } from '../services/keyboard.service';

@Directive({ selector: 'input[matKeyboard], textarea[matKeyboard]' })
export class MatKeyboardDirective implements OnDestroy {
  private _elementRef = inject(ElementRef);
  private _keyboardService = inject(MatKeyboardService);
  private _control = inject(NgControl, { optional: true, self: true });


  private _keyboardRef: MatKeyboardRef<MatKeyboardComponent>;

  readonly matKeyboard = input<string>(undefined);

  readonly darkTheme = input<boolean>(undefined);

  readonly duration = input<number>(undefined);

  readonly isDebug = input<boolean>(undefined);

  @Output() enterClick: EventEmitter<void> = new EventEmitter<void>();

  @Output() capsClick: EventEmitter<void> = new EventEmitter<void>();

  @Output() altClick: EventEmitter<void> = new EventEmitter<void>();

  @Output() shiftClick: EventEmitter<void> = new EventEmitter<void>();

  ngOnDestroy() {
    this.hideKeyboard();
  }

  @HostListener('focus', ['$event'])
  public showKeyboard() {
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
    this._keyboardRef.instance.enterClick.subscribe(() => this.enterClick.next());
    this._keyboardRef.instance.capsClick.subscribe(() => this.capsClick.next());
    this._keyboardRef.instance.altClick.subscribe(() => this.altClick.next());
    this._keyboardRef.instance.shiftClick.subscribe(() => this.shiftClick.next());
  }

  @HostListener('blur', ['$event'])
  public hideKeyboard() {
    if (this._keyboardRef) {
      this._keyboardRef.dismiss();
    }
  }

}
