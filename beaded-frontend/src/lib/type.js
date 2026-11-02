/* Measurements that keep the gold thread running through the middle of the letters. */

function xHeight(el) {
  const style = getComputedStyle(el);
  const context = document.createElement('canvas').getContext('2d');
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return context.measureText('x').actualBoundingBoxAscent;
}

/* How far below `frame`'s top the middle of `el`'s lowercase letters sits. */
export function threadCenter(el, frame) {
  const probe = document.createElement('i');
  probe.style.cssText = 'display:inline-block;width:0;height:0';
  el.append(probe);
  const baseline = probe.getBoundingClientRect().bottom - frame.getBoundingClientRect().top;
  probe.remove();
  return baseline - xHeight(el) * 0.5;
}

/* Sets the font size so `el` fills exactly `width` pixels. */
export function fitText(el, width) {
  el.style.fontSize = '100px';
  el.style.fontSize = `${(100 * width) / el.getBoundingClientRect().width}px`;
}
