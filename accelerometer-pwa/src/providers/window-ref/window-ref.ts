import { Injectable } from '@angular/core';

function getWindow(): Window {
  return window;
}

@Injectable()
export class WindowRefProvider {
  get nativeWindow(): Window {
    return getWindow();
  }
}
