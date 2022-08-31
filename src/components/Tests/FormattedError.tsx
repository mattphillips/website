import React from "react";
import { TestError } from "./Message";

type Props = {
  error: TestError;
  path: string;
};

export const FormattedError: React.FC<Props> = ({ error, path }) => {
  return (
    <div
      className="p-2 text-sm leading-[1.6] whitespace-pre-wrap text-white"
      dangerouslySetInnerHTML={{ __html: formatDiffMessage(error, path) }}
    ></div>
  );
};

export const generateRandomId = (): string => Math.floor(Math.random() * 10000).toString();

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const formatDiffMessage = (error: TestError, path: string) => {
  let finalMessage: string = "";
  if (error.matcherResult) {
    finalMessage = `<span>${escapeHtml(error.message)
      .replace(/(expected)/m, `<span style="color:#15c213">$1</span>`)
      .replace(/(received)/m, `<span style="color:#f7362b">$1</span>`)
      .replace(/(Difference:)/m, `<span>$1</span>`)
      .replace(/(Expected:)(.*)/m, `<span>$1</span><span style="color:#15c213">$2</span>`)
      .replace(/(Received:)(.*)/m, `<span>$1</span><span style="color:#f7362b">$2</span>`)
      .replace(/^(-.*)/gm, `<span style="color:#f7362b">$1</span>`)
      .replace(/^(\+.*)/gm, `<span style="color:#15c213">$1</span>`)}</span>`;
  } else {
    finalMessage = escapeHtml(error.message);
  }

  if (
    error.mappedErrors &&
    error.mappedErrors[0] &&
    error.mappedErrors[0].fileName.endsWith(path) &&
    error.mappedErrors[0]._originalScriptCode
  ) {
    const mappedError = error.mappedErrors[0] as any;

    const widestNumber =
      Math.max(...mappedError._originalScriptCode.map((code: any) => (code.lineNumber + "").length)) + 2;
    const margin = Array.from({ length: widestNumber }).map(() => " ");

    finalMessage += "<br />";
    finalMessage += "<br />";
    finalMessage += "<div>";
    mappedError._originalScriptCode
      .filter((x: any) => x.content.trim())
      .forEach((code: any) => {
        const currentLineMargin = (code.lineNumber + "").length;
        const newMargin = [...margin];
        newMargin.length -= currentLineMargin;
        if (code.highlight) {
          newMargin.length -= 2;
        }

        const toBeIndex = code.content.indexOf(".to");
        const toBeMargin = Array.from({ length: margin.length + toBeIndex - (widestNumber - 1) }, () => " ");

        const content = escapeHtml(code.content)
          .replace(
            /(describe|test|it)(\()(&#039;|&quot;|`)(.*)(&#039;|&quot;|`)/m,
            `<span>$1$2$3</span><span style="color:#3fbabe">$4</span><span>$5</span>`
          )
          .replace(
            /(expect\()(.*)(\)\..*)(to[\w\d]*)(\()(.*)(\))/m,
            `<span>$1</span><span style="color:#f7362b">$2</span><span>$3</span><span style="text-decoration: underline; color: white">$4</span><span>$5</span><span style="color:#15c213">$6</span><span>$7</span>`
          );

        finalMessage +=
          `<div ${code.highlight ? `style="font-weight:900; color: rgba(255, 255, 255, 0.5)"` : ``}>` +
          (code.highlight ? `<span style="color:#f7362b;">></span> ` : "") +
          newMargin.join("") +
          escapeHtml("" + code.lineNumber) +
          " | " +
          content +
          "</div>" +
          (code.highlight
            ? "<div>" +
              margin.join("") +
              " | " +
              toBeMargin.join("") +
              '<span style="color:#f7362b">^</span>' +
              "</div>"
            : "");
      });
    finalMessage += "</div>";
  }

  return finalMessage.replace(/(?:\r\n|\r|\n)/g, "<br />");
};
