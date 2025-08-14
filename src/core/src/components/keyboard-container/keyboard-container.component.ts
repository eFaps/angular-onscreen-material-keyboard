import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
} from "@angular/cdk/portal";
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EmbeddedViewRef,
  HostListener,
  OnDestroy,
  signal,
  viewChild,
} from "@angular/core";
import { Observable, Subject } from "rxjs";

import { MatKeyboardConfig } from "../../configs/keyboard.config";

/**
 * Internal component that wraps user-provided keyboard content.
 * @docs-private
 */
@Component({
  selector: "mat-keyboard-container",
  templateUrl: "./keyboard-container.component.html",
  styleUrls: ["./keyboard-container.component.scss"],
  host: {
    "[attr.role]": "alert",
    "[class.visible]": "isVisible()",
    "(transitionend)": "transitionend()",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
  imports: [CdkPortalOutlet],
})
export class MatKeyboardContainerComponent
  extends BasePortalOutlet
  implements OnDestroy
{
  /** Whether the component has been destroyed. */
  private destroyed = false;

  /** The portal outlet inside of this container into which the keyboard content will be loaded. */
  private readonly portalOutlet = viewChild(CdkPortalOutlet);

  /** Subject for notifying that the keyboard has exited from view. */
  onExit: Subject<void> = new Subject();

  /** Subject for notifying that the keyboard has finished entering the view. */
  onEnter: Subject<void> = new Subject();

  isVisible = signal<boolean>(false);

  // the keyboard configuration
  keyboardConfig: MatKeyboardConfig;

  hasTransitionend = false;

  @HostListener("mousedown", ["$event"])
  onMousedown(event: MouseEvent) {
    event.preventDefault();
  }

  /** Attach a component portal as content to this keyboard container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    const outlet = this.portalOutlet();
    if (outlet.hasAttached()) {
      throw Error(
        "Attempting to attach keyboard content after content is already attached",
      );
    }

    return outlet.attachComponentPortal(portal);
  }

  // Attach a template portal as content to this keyboard container
  attachTemplatePortal(): EmbeddedViewRef<any> {
    throw Error("Not yet implemented");
  }

  /** Begin animation of keyboard entrance into view. */
  enter() {
    if (!this.destroyed) {
      this.isVisible.set(true);
    }
  }

  /** Begin animation of the snack bar exiting from view. */
  exit(): Observable<void> {
    this.isVisible.set(false);
    if (!this.hasTransitionend) {
      this.onExit.next();
      this.onExit.complete();
    }
    return this.onExit;
  }

  /**
   * Makes sure the exit callbacks have been invoked when the element is destroyed.
   */
  ngOnDestroy() {
    this.destroyed = true;
    this.onExit.next();
    this.onExit.complete();
  }

  transitionend() {
    this.hasTransitionend = true;
    if (this.isVisible()) {
      this.onEnter.next();
      this.onEnter.complete();
    } else {
      this.onExit.next();
      this.onExit.complete();
    }
  }
}
