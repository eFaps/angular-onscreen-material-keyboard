import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, inject, input, output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MAT_KEYBOARD_DEADKEYS } from '../../configs/keyboard-deadkey.config';
import { KeyboardClassKey } from '../../enums/keyboard-class-key.enum';
import { IKeyboardDeadkeys } from '../../interfaces/keyboard-deadkeys.interface';
import { IMatIcon } from '../../interfaces/keyboard-icons.interface';
import { MatButton } from '@angular/material/button';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

export const VALUE_NEWLINE = '\n\r';
export const VALUE_SPACE = ' ';
export const VALUE_TAB = '\t';
const REPEAT_TIMEOUT = 500;
const REPEAT_INTERVAL = 100;

@Component({
    selector: 'mat-keyboard-key',
    templateUrl: './keyboard-key.component.html',
    styleUrls: ['./keyboard-key.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    imports: [MatButton, NgClass, MatIcon, AsyncPipe]
})
export class MatKeyboardKeyComponent implements OnInit, OnDestroy {
  private _deadkeys = inject<IKeyboardDeadkeys>(MAT_KEYBOARD_DEADKEYS);
  private _deadkeyKeys: string[] = [];
  private _repeatTimeoutHandler: any;
  private _repeatIntervalHandler: any;
  private _repeatState: boolean = false; // true if repeating, false if waiting

  active$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  pressed$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly key = input<string | KeyboardClassKey>(undefined);

  readonly icon = input<IMatIcon>(undefined);

  @Input()
  set active(active: boolean) {
    this.active$.next(active);
  }

  get active(): boolean {
    return this.active$.getValue();
  }

  @Input()
  set pressed(pressed: boolean) {
    this.pressed$.next(pressed);
  }

  get pressed(): boolean {
    return this.pressed$.getValue();
  }

  readonly input = input<ElementRef>(undefined);

  readonly control = input<UntypedFormControl>(undefined);

  readonly genericClick = output<MouseEvent>();

  readonly enterClick = output<MouseEvent>();

  readonly bkspClick = output<MouseEvent>();

  readonly capsClick = output<MouseEvent>();

  readonly altClick = output<MouseEvent>();

  readonly shiftClick = output<MouseEvent>();

  readonly spaceClick = output<MouseEvent>();

  readonly tabClick = output<MouseEvent>();

  readonly keyClick = output<MouseEvent>();

  get lowerKey(): string {
    return `${this.key()}`.toLowerCase();
  }

  get charCode(): number {
    return `${this.key()}`.charCodeAt(0);
  }

  get isClassKey(): boolean {
    return this.key() in KeyboardClassKey;
  }

  get isDeadKey(): boolean {
    return this._deadkeyKeys.some((deadKey: string) => deadKey === `${this.key()}`);
  }

  get hasIcon(): boolean {
    const icon = this.icon();
    return icon !== undefined && icon !== null;
  }

  get iconName(): string {
    return this.icon().name || '';
  }

  get fontSet(): string {
    return this.icon().fontSet || '';
  }

  get fontIcon(): string {
    return this.icon().fontIcon || '';
  }

  get svgIcon(): string {
    return this.icon().svgIcon || '';
  }

  get cssClass(): string {
    const classes = [];

    if (this.hasIcon) {
      classes.push('mat-keyboard-key-modifier');
      classes.push(`mat-keyboard-key-${this.lowerKey}`);
    }

    if (this.isDeadKey) {
      classes.push('mat-keyboard-key-deadkey');
    }

    return classes.join(' ');
  }

  get inputValue(): string {
    const control = this.control();
    const input = this.input();
    if (control) {
      return control.value;
    } else if (input && input.nativeElement && input.nativeElement.value) {
      return input.nativeElement.value;
    } else {
      return '';
    }
  }

  set inputValue(inputValue: string) {
    const control = this.control();
    const input = this.input();
    if (control) {
      control.setValue(inputValue);
    } else if (input && input.nativeElement) {
      input.nativeElement.value = inputValue;
    }
  }

  ngOnInit() {
    // read the deadkeys
    this._deadkeyKeys = Object.keys(this._deadkeys);
  }

  ngOnDestroy() {
    this.cancelRepeat();
  }

  onClick(event: MouseEvent) {
    // Trigger generic click event
    this.genericClick.emit(event);

    // Do not execute keypress if key is currently repeating
    if (this._repeatState) { return; }

    // Trigger a global key event. TODO: investigate
    // this._triggerKeyEvent();

    // Manipulate the focused input / textarea value
    const caret = this.input() ? this._getCursorPosition() : 0;

    let char: string;
    const key = this.key();
    switch (key) {
      // this keys have no actions yet
      // TODO: add deadkeys and modifiers
      case KeyboardClassKey.Alt:
      case KeyboardClassKey.AltGr:
      case KeyboardClassKey.AltLk:
        this.altClick.emit(event);
        break;

      case KeyboardClassKey.Bksp:
        this.deleteSelectedText();
        this.bkspClick.emit(event);
        break;

      case KeyboardClassKey.Caps:
        this.capsClick.emit(event);
        break;

      case KeyboardClassKey.Enter:
        if (this._isTextarea()) {
          char = VALUE_NEWLINE;
        } else {
          this.enterClick.emit(event);
          // TODO: trigger submit / onSubmit / ngSubmit properly (for the time being this has to be handled by the user himself)
          // console.log(this.control.ngControl.control.root)
          // this.input.nativeElement.form.submit();
        }
        break;

      case KeyboardClassKey.Shift:
        this.shiftClick.emit(event);
        break;

      case KeyboardClassKey.Space:
        char = VALUE_SPACE;
        this.spaceClick.emit(event);
        break;

      case KeyboardClassKey.Tab:
        char = VALUE_TAB;
        this.tabClick.emit(event);
        break;

      default:
        // the key is not mapped or a string
        char = `${key}`;
        this.keyClick.emit(event);
        break;
    }

    const input = this.input();
    if (char && input) {
      this.replaceSelectedText(char);
      this._setCursorPosition(caret + 1);
    }

    // Dispatch Input Event for Angular to register a change
    if (input && input.nativeElement) {
      setTimeout(() => {
        this.input().nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }

  // Handle repeating keys. Keypress logic derived from onClick()
  onPointerDown(event: PointerEvent) {
    this.cancelRepeat();
    this._repeatState = false;
    this._repeatTimeoutHandler = setTimeout(() => {
      // Initialize keypress variables
      let char: string;
      let keyFn: () => void;

      const key = this.key();
      switch (key) {
        // Ignore non-repeating keys
        case KeyboardClassKey.Alt:
        case KeyboardClassKey.AltGr:
        case KeyboardClassKey.AltLk:
        case KeyboardClassKey.Caps:
        case KeyboardClassKey.Enter:
        case KeyboardClassKey.Shift:
          return;

        case KeyboardClassKey.Bksp:
          keyFn = () => {
            this.deleteSelectedText();
            this.bkspClick.emit(event);
          };
          break;

        case KeyboardClassKey.Space:
          char = VALUE_SPACE;
          keyFn = () => this.spaceClick.emit(event);
          break;

        case KeyboardClassKey.Tab:
          char = VALUE_TAB;
          keyFn = () => this.tabClick.emit(event);
          break;

        default:
          char = `${key}`;
          keyFn = () => this.keyClick.emit(event);
          break;
      }

      // Execute repeating keypress
      this._repeatIntervalHandler = setInterval(() => {
        const caret = this.input() ? this._getCursorPosition() : 0;
        this._repeatState = true;

        if (keyFn) { keyFn(); }

        const input = this.input();
        if (char && input) {
          this.replaceSelectedText(char);
          this._setCursorPosition(caret + 1);
        }

        if (input && input.nativeElement) {
          setTimeout(() => this.input().nativeElement.dispatchEvent(new Event('input', { bubbles: true })));
        }
      }, REPEAT_INTERVAL);
    }, REPEAT_TIMEOUT);
  }

  cancelRepeat() {
    if (this._repeatTimeoutHandler) {
      clearTimeout(this._repeatTimeoutHandler);
      this._repeatTimeoutHandler = null;
    }

    if (this._repeatIntervalHandler) {
      clearInterval(this._repeatIntervalHandler);
      this._repeatIntervalHandler = null;
    }
  }

  private deleteSelectedText(): void {
    const value = this.inputValue ? this.inputValue.toString() : '';
    let caret = this.input() ? this._getCursorPosition() : 0;
    let selectionLength = this._getSelectionLength();
    if (selectionLength === 0) {
      if (caret === 0) {
        return;
      }

      caret--;
      selectionLength = 1;
    }

    const headPart = value.slice(0, caret);
    const endPart = value.slice(caret + selectionLength);

    this.inputValue = [headPart, endPart].join('');
    this._setCursorPosition(caret);
  }

  private replaceSelectedText(char: string): void {
    const value = this.inputValue ? this.inputValue.toString() : '';
    const caret = this.input() ? this._getCursorPosition() : 0;
    const selectionLength = this._getSelectionLength();
    const headPart = value.slice(0, caret);
    const endPart = value.slice(caret + selectionLength);

    this.inputValue = [headPart, char, endPart].join('');
  }

  // TODO: Include for repeating keys as well (if this gets implemented)
  // private _triggerKeyEvent(): Event {
  //   const keyboardEvent = new KeyboardEvent('keydown');
  //   //
  //   // keyboardEvent[initMethod](
  //   //   true, // bubbles
  //   //   true, // cancelable
  //   //   window, // viewArg: should be window
  //   //   false, // ctrlKeyArg
  //   //   false, // altKeyArg
  //   //   false, // shiftKeyArg
  //   //   false, // metaKeyArg
  //   //   this.charCode, // keyCodeArg : unsigned long - the virtual key code, else 0
  //   //   0 // charCodeArgs : unsigned long - the Unicode character associated with the depressed key, else 0
  //   // );
  //   //
  //   // window.document.dispatchEvent(keyboardEvent);

  //   return keyboardEvent;
  // }

  // inspired by:
  // ref https://stackoverflow.com/a/2897510/1146207
  private _getCursorPosition(): number {
    const input = this.input();
    if (!input) {
      return;
    }

    if ('selectionStart' in input.nativeElement) {
      // Standard-compliant browsers
      return input.nativeElement.selectionStart;
    } else if ('selection' in window.document) {
      // IE
      input.nativeElement.focus();
      const selection: any = window.document['selection'];
      const sel = selection.createRange();
      const selLen = selection.createRange().text.length;
      sel.moveStart('character', -this.control().value.length);

      return sel.text.length - selLen;
    }
  }

  private _getSelectionLength(): number {
    const input = this.input();
    if (!input) {
      return;
    }

    if ('selectionEnd' in input.nativeElement) {
      // Standard-compliant browsers
      return input.nativeElement.selectionEnd - input.nativeElement.selectionStart;
    }

    if ('selection' in window.document) {
      // IE
      input.nativeElement.focus();
      const selection: any = window.document['selection'];
      return selection.createRange().text.length;
    }
  }

  // inspired by:
  // ref https://stackoverflow.com/a/12518737/1146207
  // tslint:disable one-line
  private _setCursorPosition(position: number): boolean {
    const input = this.input();
    if (!input) {
      return;
    }

    this.inputValue = this.control().value;
    // ^ this is used to not only get "focus", but
    // to make sure we don't have it everything -selected-
    // (it causes an issue in chrome, and having it doesn't hurt any other browser)

    if ('createTextRange' in input.nativeElement) {
      const range = input.nativeElement.createTextRange();
      range.move('character', position);
      range.select();
      return true;
    } else {
      // (el.selectionStart === 0 added for Firefox bug)
      if (input.nativeElement.selectionStart || input.nativeElement.selectionStart === 0) {
        input.nativeElement.focus();
        input.nativeElement.setSelectionRange(position, position);
        return true;
      }
      // fail city, fortunately this never happens (as far as I've tested) :)
      else {
        input.nativeElement.focus();
        return false;
      }
    }
  }

  private _isTextarea(): boolean {
    const input = this.input();
    return input && input.nativeElement && input.nativeElement.tagName === 'TEXTAREA';
  }

}
