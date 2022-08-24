import React from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import { SandpackClient, ListenerFunction, SandpackMessage } from "@codesandbox/sandpack-client";
import { generateRandomId } from "./utils";

export const useSandpackClient = () => {
  const { sandpack, listen, dispatch } = useSandpack();
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const clientId = React.useRef<string>(generateRandomId());

  React.useEffect(() => {
    const iframeElement = iframeRef.current!;
    const clientIdValue = clientId.current;

    sandpack.registerBundler(iframeElement, clientIdValue);

    return () => sandpack.unregisterBundler(clientId.current);
  }, []);

  const getClient = (): SandpackClient | null => {
    return sandpack.clients[clientId.current] || null;
  };

  return {
    sandpack,
    getClient,
    iframe: iframeRef,
    listen: (listener: ListenerFunction) => listen(listener, clientId.current),
    dispatch: (message: SandpackMessage) => dispatch(message, clientId.current),
  };
};
