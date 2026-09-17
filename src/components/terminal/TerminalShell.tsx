"use client";

import { FormEvent, ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const suggestions = ["home","help", "about", "cd projects", "cd blogs", "cd experience", "resume"];

type HistoryEntry =
  | {
      id: string;
      command: string;
      promptPath: string;
      type: "route";
      route: string;
      output?: ReactNode;
      outputHtml?: string;
      showCommand: boolean;
    }
  | {
      id: string;
      command: string;
      promptPath: string;
      type: "help";
    }
  | {
      id: string;
      command: string;
      promptPath: string;
      type: "error";
    };

function routeForCommand(command: string, pathname: string) {
  let normalized = command.trim().toLowerCase();

  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  if (normalized === "about" || normalized === "whoami") {
    return "/about";
  }

  if (
    normalized === "ls" && pathname
  ) {
    return pathname;
  }

  if (normalized === "cd skills" || normalized === "cd skills && ls" || normalized === "cd skills/ && ls") {
    return "/skills";
  }

  if (normalized === "cd projects" || normalized === "cd projects && ls" || normalized === "cd projects/ && ls") {
    return "/projects";
  }

  if (normalized === "cd experience" || normalized === "cd experience && ls" || normalized === "cd experience/ && ls") {
    return "/experience";
  }

  if (normalized === "cd blogs" || normalized === "cd blogs && ls" || normalized === "cd blogs/ && ls") {
    return "/blogs";
  }

  if (
    normalized === "resume" ||
    normalized === "overview" ||
    normalized === "cat skills/* experience/* projects/*" ||
    normalized === "cat skills/* projects/* experience/*" ||
    normalized === "cat experience/* skills/* projects/*" ||
    normalized === "cat experience/* projects/* skills/*" ||
    normalized === "cat projects/* skills/* experience/*" ||
    normalized === "cat projects/* experience/* skills/*"
  ) {
    return "/resume";
  }

  if (normalized === "help" || normalized === "man") {
    return null;
  }

  if(normalized==="home"){
    return "/";
  }

  const projectMatch = normalized.match(
    /^(?:cat projects\/|cat projects |cd projects && cat )([a-z0-9-]+)$/
  );

  if (projectMatch) {
    return `/projects/${projectMatch[1]}`;
  }

  const blogMatch = normalized.match(
    /^(?:cat blogs\/|cat blogs |cd blogs && cat )([a-z0-9-]+)$/
  );

  if (blogMatch) {
    return `/blogs/${blogMatch[1]}`;
  }

  return null;
}

function currentPath(pathname: string) {
  if (pathname.startsWith("/projects/")) return "~/projects";
  if (pathname.startsWith("/blogs/")) return "~/blogs";
  if (pathname === "/projects") return "~/projects";
  if (pathname === "/blogs") return "~/blogs";
  if (pathname === "/skills") return "~/skills";
  if (pathname === "/experience") return "~/experience";
  return "~";
}

function commandForPath(pathname: string) {
  if (pathname === "/skills") return "cd skills && ls";
  if (pathname === "/projects") return "cd projects && ls";

  if (pathname.startsWith("/projects/")) {
    return `cd projects && cat ${pathname.split("/").pop()}`;
  }

  if (pathname === "/experience") return "cd experience && ls";
  if (pathname === "/blogs") return "cd blogs && ls";

  if (pathname.startsWith("/blogs/")) {
    return `cd blogs && cat ${pathname.split("/").pop()}`;
  }

  if (pathname === "/about") return "about";
  if (pathname === "/resume") return "cat skills/* experience/* projects/*";

  return undefined;
}

function parentPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return "/";

  return `/${segments.slice(0, -1).join("/")}`;
}

export default function TerminalShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const promptPath = currentPath(pathname);
  const initialCommand = commandForPath(pathname);
  const entrySequence = useRef(1);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    {
      id: "entry-0",
      command: initialCommand ?? "",
      promptPath,
      type: "route",
      route: pathname,
      output: children,
      showCommand: Boolean(initialCommand),
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const terminalEnd = useRef<HTMLDivElement>(null);
  const liveRouteOutput = useRef<HTMLDivElement>(null);
  const pendingRoute = useRef<{ id: string; route: string } | null>(null);
  const previousPathname = useRef(pathname);

  useLayoutEffect(() => {
    const scrollToTerminalEnd = () => {
      terminalEnd.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    };

    scrollToTerminalEnd();
    const frame = requestAnimationFrame(scrollToTerminalEnd);

    return () => cancelAnimationFrame(frame);
  }, [history, pathname]);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;

    const pending = pendingRoute.current;

    if (pending?.route === pathname) {
      pendingRoute.current = null;
      setHistory((current) =>
        current.map((entry) =>
          entry.id === pending.id && entry.type === "route"
            ? { ...entry, output: children }
            : entry
        )
      );
      return;
    }

    const id = `entry-${entrySequence.current++}`;
    setHistory((current) => [
      ...current,
      {
        id,
        command: commandForPath(pathname) ?? "",
        promptPath: currentPath(pathname),
        type: "route",
        route: pathname,
        output: children,
        showCommand: Boolean(commandForPath(pathname)),
      },
    ]);
  }, [children, pathname]);

  function createEntryId() {
    return `entry-${entrySequence.current++}`;
  }

  function freezeLiveRouteOutput() {
    const outputHtml = liveRouteOutput.current?.innerHTML;

    if (!outputHtml) {
      return;
    }

    setHistory((current) => {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        const entry = current[index];

        if (entry.type === "route" && entry.output) {
          return current.map((currentEntry, currentIndex) =>
            currentIndex === index
              ? { ...currentEntry, output: undefined, outputHtml }
              : currentEntry
          );
        }
      }

      return current;
    });
  }

  function navigate(command: string, route: string, path: string) {
    freezeLiveRouteOutput();

    const id = createEntryId();
    const entry: HistoryEntry = {
      id,
      command,
      promptPath: path,
      type: "route",
      route,
      showCommand: true,
    };

    setHistory((current) => [...current, entry]);

    if (route === pathname) {
      setHistory((current) =>
        current.map((currentEntry) =>
          currentEntry.id === id && currentEntry.type === "route"
            ? { ...currentEntry, output: children }
            : currentEntry
        )
      );
      return;
    }

    pendingRoute.current = { id, route };
    router.push(route);
  }

  function onTerminalClickCapture(event: React.MouseEvent<HTMLElement>) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest<HTMLAnchorElement>("a[href]");

    if (!link || link.target === "_blank") {
      return;
    }

    const destination = new URL(link.href, window.location.href);

    if (destination.origin === window.location.origin && destination.pathname !== pathname) {
      freezeLiveRouteOutput();
    }
  }

  function execute(rawCommand: string) {
    const command = rawCommand.trim().toLowerCase();

    if (!command) return;

    // --------------------
    // clear
    // --------------------

    if (command === "clear") {
      const id = createEntryId();
      pendingRoute.current = null;
      setHistory([
        {
          id,
          command: initialCommand ?? "",
          promptPath,
          type: "route",
          route: pathname,
          output: children,
          showCommand: Boolean(initialCommand),
        },
      ]);
      setInput("");
      setHistoryIndex(-1);
      return;
    }

    // --------------------
    // help
    // --------------------

    if (command === "help" || command === "man") {
      setHistory((current) => [
        ...current,
        {
          id: createEntryId(),
          command,
          promptPath,
          type: "help",
        },
      ]);

      setInput("");
      setHistoryIndex(-1);
      return;
    }

    if (command === "cd ..") {
      const parent = parentPath(pathname);

      if (parent !== pathname) {
        navigate(command, parent, promptPath);
      }

      setInput("");
      setHistoryIndex(-1);
      return;
    }

    // --------------------
    // route command
    // --------------------

    const route = routeForCommand(command, pathname);

    if (route) {
      navigate(command, route, promptPath);

      setInput("");
      setHistoryIndex(-1);

      router.push(route);
      return;
    }

    // --------------------
    // invalid command
    // --------------------

    setHistory((current) => [
      ...current,
      {
        id: createEntryId(),
        command,
        promptPath,
        type: "error",
      },
    ]);

    setInput("");
    setHistoryIndex(-1);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    execute(input);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    if (!history.length) return;

    const nextIndex =
      event.key === "ArrowUp"
        ? Math.min(historyIndex + 1, history.length - 1)
        : Math.max(historyIndex - 1, -1);

    setHistoryIndex(nextIndex);

    setInput(
      nextIndex === -1
        ? ""
        : history[history.length - 1 - nextIndex].command
    );
  }

  return (
    <main className="terminal-app" onClickCapture={onTerminalClickCapture}>
      <section
        className="terminal-window"
        aria-label="Interactive portfolio terminal"
      >
        <div className="window-bar">
          <div className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>

          <span className="window-title">
            aryan21 - bash - terminal
          </span>

          <span className="window-lock">
            Secure Shell
          </span>
        </div>

        <div className="terminal-body">

          {/* BOOT MESSAGE */}

          <div className="boot-line">
            <span className="prompt-mark">&gt;</span>
            <span>hello, human.</span>
            <span className="cursor-block" aria-hidden="true" />
          </div>

          <p className="boot-copy">
            I am Aryan Sewani and I use linux btw.
            <br />
            Try writing a command (eg. cd skills/) or read the command manual by typing help / man.
            <br />
            You can also navigate directly by clicking on the yellow hyperlinks on home :)
          </p>

          <div className="terminal-divider" />

          {/* TRANSCRIPT */}

          <div className="terminal-transcript" aria-live="polite">

            {/* OLD COMMAND HISTORY */}

            {history.map((entry) => (
              <div
                className="history-entry"
                key={entry.id}
              >
                {(entry.type !== "route" || entry.showCommand) && (
                  <div className="command-echo">
                    <span className="prompt-mark">&gt;</span>
                    <span>{entry.promptPath} $</span>
                    <strong>{entry.command}</strong>
                  </div>
                )}

                <div className="command-output">

                  {entry.type === "help" && <HelpOutput />}

                  {entry.type === "error" && (
                    <p className="error-output">
                      command not found:{" "}
                      <strong>{entry.command}</strong>.
                      Try{" "}
                      <button
                        type="button"
                        onClick={() => execute("help")}
                      >
                        help
                      </button>
                      .
                    </p>
                  )}

                  {entry.type === "route" &&
                    (entry.outputHtml ? (
                      <div
                        className="route-output"
                        dangerouslySetInnerHTML={{ __html: entry.outputHtml }}
                      />
                    ) : entry.output ? (
                      <div className="route-output" ref={liveRouteOutput}>
                        {entry.output}
                      </div>
                    ) : (
                      <p className="output-intro">
                        navigating to <strong>{entry.route}</strong>...
                      </p>
                    ))}

                </div>
              </div>
            ))}
            
          </div>

          {/* INPUT */}

          <form
            className="command-form"
            onSubmit={onSubmit}
          >
            <span className="prompt-mark">&gt;</span>

            <span className="input-path">
              {promptPath} $
            </span>

            <input
              aria-label="Terminal command"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="type a command..."
              autoComplete="off"
              spellCheck={false}
            />
          </form>

          {/* SUGGESTIONS */}

          <div className="suggestion-bar">
            <span className="suggestion-label">
              TRY
            </span>

            {suggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => execute(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div ref={terminalEnd} />

        </div>
      </section>
    </main>
  );
}

function HelpOutput() {
  return (
    <div className="help-output">
      <p className="output-intro">
        A small, friendly command set. You can also use the links above.
      </p>

      <div className="command-list">
        <div>
          <code>about</code>
          <span>read a little about me</span>
        </div>

        <div>
          <code>ls</code>
          <span>see what is here</span>
        </div>

        <div>
          <code>cd projects or (cd projects && ls)</code>
          <span>explore selected work</span>
        </div>

        <div>
          <code>cd experience</code>
          <span>see where I have been</span>
        </div>

        <div>
          <code>cd blogs</code>
          <span>read field notes and essays</span>
        </div>

        <div>
          <code>resume / (cat skills/* experience/* projects/*)</code>
          <span>open the quick overview</span>
        </div>

        <div>
          <code>clear</code>
          <span>clear terminal-only output</span>
        </div>

        <div>
          <code>cd ..</code>
          <span>
            Go back a directory (unless you are already at user directory)
          </span>
        </div>

        <div>
          <code>cat</code>
          <span>
            You need to figure out the file names tho :-D
          </span>
        </div>
      </div>
    </div>
  );
}
