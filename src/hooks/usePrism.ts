import React from "react";

export const usePrism = () => {
  // Adapted from: https://css-tricks.com/syntax-highlighting-prism-on-a-next-js-site/
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const allPres = ref.current!.querySelectorAll("pre");
    const cleanup: (() => void)[] = [];

    for (const pre of allPres) {
      const code = pre.firstElementChild;
      if (!code || !/code/i.test(code.tagName)) {
        continue;
      }

      const language = [...pre.classList.values()].find((it) => /language-/.test(it))?.replace(/language-/, "");

      pre.appendChild(createCopyButton(code));

      if (pre.parentNode !== null) {
        pre.parentNode.prepend(createLanguageLabel(language || ""));
      }

      const highlightRanges = pre.dataset.line;
      const lineNumbersContainer = pre.querySelector(".line-numbers-rows");

      if (!highlightRanges || !lineNumbersContainer) {
        continue;
      }

      const runHighlight = () => highlightCode(pre, highlightRanges, lineNumbersContainer);
      runHighlight();

      const ro = new ResizeObserver(runHighlight);
      ro.observe(pre);

      cleanup.push(() => ro.disconnect());
    }

    return () => cleanup.forEach((f) => f());
  }, []);

  return ref;
};

function highlightCode(pre: HTMLPreElement, highlightRanges: string, lineNumberRowsContainer: Element) {
  const ranges = highlightRanges.split(",").filter((val) => val);

  const preWidth = pre.scrollWidth;

  for (const range of ranges) {
    let [start, end] = range.split("-");
    if (!start || !end) {
      start = range;
      end = range;
    }

    for (let i = +start; i <= +end; i++) {
      const lineNumberSpan: HTMLSpanElement | null = lineNumberRowsContainer.querySelector(`span:nth-child(${i})`);
      if (lineNumberSpan !== null) {
        lineNumberSpan.style.setProperty("--highlight-background", "rgb(100 100 100 / 0.1)");
        lineNumberSpan.style.setProperty("--highlight-width", `${preWidth}px`);
      }
    }
  }
}

function createCopyButton(codeEl: Element) {
  const button = document.createElement("button");
  button.classList.add("prism-copy-button");
  const copy = `
<svg xmlns="http://www.w3.org/2000/svg" style="height:1.5rem; width: 1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
</svg>
  `;

  const tick = `
    <svg xmlns="http://www.w3.org/2000/svg" style="height:1.5rem; width: 1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  `;
  button.innerHTML = copy;
  button.ariaLabel = "Copy";

  button.addEventListener("click", () => {
    if (button.innerHTML === tick) {
      return;
    }
    navigator.clipboard.writeText(codeEl.textContent || "");
    button.innerHTML = tick;
    button.disabled = true;
    setTimeout(() => {
      button.innerHTML = copy;
      button.disabled = false;
    }, 3000);
  });

  return button;
}

function createLanguageLabel(language: string) {
  const div = document.createElement("div");
  div.classList.add("prism-language-label");

  div.innerHTML = language.toUpperCase();

  return div;
}
