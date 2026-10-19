// Wide-table cues (rules/layout.md Wide tables): data-more-start / data-more-end on each .table-wrap while there is
// more to scroll that way, and --pin-w (the pinned column's width) for scroll-padding. Inline it in a prototype.
function tableScroll(wrap) {
  const scroller = wrap.querySelector(".table-scroll");
  if (!scroller) return;
  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const x = Math.abs(scroller.scrollLeft); // negative in RTL
    wrap.toggleAttribute("data-more-start", x > 1); // 1px: sub-pixel rounding at the ends
    wrap.toggleAttribute("data-more-end", max - x > 1);
    const pin = scroller.querySelector(".pin");
    scroller.style.setProperty("--pin-w", pin ? `${pin.offsetWidth}px` : "0px");
  };
  scroller.addEventListener("scroll", update, { passive: true });
  const ro = new ResizeObserver(update);
  ro.observe(scroller);
  if (scroller.firstElementChild) ro.observe(scroller.firstElementChild);
  update();
}
document.querySelectorAll(".table-wrap").forEach(tableScroll);
