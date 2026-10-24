import {
  mdiArrowDown,
  mdiArrowUp,
  mdiCamera,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClockOutline,
  mdiClose,
  mdiDelete,
  mdiFoodForkDrink,
  mdiImage,
  mdiLink,
  mdiLock,
  mdiMagnify,
  mdiMinus,
  mdiOpenInNew,
  mdiPencil,
  mdiPlus,
} from "@mdi/js";
import { html, svg, type TemplateResult } from "lit";

export const paths = {
  arrowDown: mdiArrowDown,
  arrowUp: mdiArrowUp,
  camera: mdiCamera,
  left: mdiChevronLeft,
  right: mdiChevronRight,
  clock: mdiClockOutline,
  close: mdiClose,
  delete: mdiDelete,
  food: mdiFoodForkDrink,
  image: mdiImage,
  link: mdiLink,
  lock: mdiLock,
  search: mdiMagnify,
  minus: mdiMinus,
  external: mdiOpenInNew,
  edit: mdiPencil,
  plus: mdiPlus,
};

export const icon = (path: string): TemplateResult =>
  html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${path}></path>`}</svg>`;
