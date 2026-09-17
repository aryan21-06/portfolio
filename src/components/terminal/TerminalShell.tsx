"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const suggestions = ["help", "about", "cd projects", "cd blogs", "cd experience", "resume"];

type HistoryEntry =
  | {
      command: string;
      promptPath: string;
      type: "route";
      route: string;
    }
  | {
      command: string;
      promptPath: string;
      type: "help";
    }
  | {
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
    normalized === "cat skills/* experience/* projects/*"
  ) {
    return "/resume";
  }

  if (normalized === "help" || normalized === "man") {
    return null;
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

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const terminalEnd = useRef<HTMLDivElement>(null);

  const promptPath = currentPath(pathname);
  const initialCommand = commandForPath(pathname);

  useEffect(() => {
    terminalEnd.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [history, pathname]);

  function execute(rawCommand: string) {
    const command = rawCommand.trim().toLowerCase();

    if (!command) return;

    // --------------------
    // clear
    // --------------------

    if (command === "clear") {
      setHistory([]);
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
        router.push(parent);
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
      setHistory((current) => [
        ...current,
        {
          command,
          promptPath,
          type: "route",
          route,
        },
      ]);

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
    <main className="terminal-app">
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
            public workspace
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
            I am Aryan Sewani and this terminal and shell contains all about me.
            <br />
            If you are a Linux-holic, try typing a command like cd skills/
            <br />
            You can also navigate directly by clicking on the yellow hyperlinks :)
          </p>

          <div className="terminal-divider" />

          {/* TRANSCRIPT */}

          <div className="terminal-transcript" aria-live="polite">

            {/* OLD COMMAND HISTORY */}

            {history.map((entry, index) => (
              <div
                className="history-entry"
                key={`${entry.command}-${index}`}
              >
                <div className="command-echo">
                  <span className="prompt-mark">&gt;</span>
                  <span>{entry.promptPath} $</span>
                  <strong>{entry.command}</strong>
                </div>

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

                  {entry.type === "route" && (
                    <p className="output-intro">
                      navigating to{" "}
                      <strong>{entry.route}</strong>...
                    </p>
                  )}

                </div>
              </div>
            ))}
            
            {/* CURRENT ROUTE */}

            {initialCommand && (
              <>
                <div className="route-command">
                  <div className="command-echo">
                    <span className="prompt-mark">&gt;</span>
                    <span>{promptPath} $</span>
                    <strong>{initialCommand}</strong>
                  </div>
                </div>

              </>
            )}

            <div className="route-output">
              {children}
            </div>

            <div ref={terminalEnd} />
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
