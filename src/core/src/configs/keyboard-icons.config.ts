import { KeyboardClassKey } from "../enums/keyboard-class-key.enum";
import { IKeyboardIcons } from "../interfaces/keyboard-icons.interface";

export const KEYBOARD_ICONS: IKeyboardIcons = {
  [KeyboardClassKey.Bksp]: { name: "keyboard_backspace" },
  [KeyboardClassKey.Caps]: { name: "keyboard_capslock" },
  [KeyboardClassKey.Enter]: { name: "keyboard_return" },
  [KeyboardClassKey.Shift]: { name: "keyboard_arrow_up" },
  [KeyboardClassKey.Space]: { name: " " },
  [KeyboardClassKey.Tab]: { name: "keyboard_tab" },
};
