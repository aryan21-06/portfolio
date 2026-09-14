"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const suggestions = ["help", "about", "ls", "cd projects", "cd blogs", "resume"];

function routeForCommand(command: string,pathname: string) {
  const normalized = command.trim().toLowerCase();
  if (normalized === "about" || normalized === "whoami") return "/about";
  if (normalized === "ls" || normalized === "ls /" || (normalized === "cd .." && pathname!=="/")) return "/";
  if (normalized === "cd skills" || normalized === "ls skills") return "/skills";
  if (normalized === "cd projects" || normalized === "ls projects") return "/projects";
  if (normalized === "cd experience" || normalized === "ls experience") return "/experience";
  if (normalized === "cd blogs" || normalized === "ls blogs") return "/blogs";
  if (normalized === "resume" || normalized === "overview" || normalized === "cat skills experience projects") return "/resume";
  
  const projectMatch = normalized.match(/^(?:cat projects\/|cat |cd projects && cat )([a-z0-9-]+)$/);
  if (projectMatch) return `/projects/${projectMatch[1]}`;

  const blogMatch = normalized.match(/^(?:cat blogs\/|cd blogs && cat )([a-z0-9-]+)$/);
  if (blogMatch) return `/blogs/${blogMatch[1]}`;

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

export default function TerminalShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEnd = useRef<HTMLDivElement>(null);
  const promptPath = currentPath(pathname);
  const initialCommand = commandForPath(pathname);

  useEffect(() => {
    terminalEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [history, pathname]);

  function execute(rawCommand: string) {
    const command = rawCommand.trim().toLowerCase();
    if (!command) return;

    if (command === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    const route = routeForCommand(command,pathname);
    if (route) {
      router.push(route);
    } else {
      setHistory((current) => [...current, command]);
    }

    setInput("");
    setHistoryIndex(-1);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    execute(input);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (!history.length) return;

    const nextIndex = event.key === "ArrowUp"
      ? Math.min(historyIndex + 1, history.length - 1)
      : Math.max(historyIndex - 1, -1);
    setHistoryIndex(nextIndex);
    setInput(nextIndex === -1 ? "" : history[history.length - 1 - nextIndex]);
  }

  return (
    <main className="terminal-app">
      <section className="terminal-window" aria-label="Interactive portfolio terminal">
        <div className="window-bar">
          <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span className="window-title">aryan21 - zsh - 80x24</span>
          <span className="window-lock">public workspace</span>
        </div>
        <div className="terminal-body">
          <div className="boot-line"><span className="prompt-mark">&gt;</span><span>hello, human.</span><span className="cursor-block" aria-hidden="true" /></div>
          <p className="boot-copy">This is a portfolio in terminal form.<br />Click a path below, or type a command if that is your thing.</p>
          <div className="terminal-divider" />

          <div className="terminal-transcript" aria-live="polite">
            {history.map((command, index) => (
              <div className="history-entry" key={`${command}-${index}`}>
                <div className="command-echo"><span className="prompt-mark">&gt;</span><span>{promptPath} $</span><strong>{command}</strong></div>
                <div className="command-output">
                  {command === "help" ? <HelpOutput /> : command === "sudo make coffee" ? <CoffeeOutput /> : <p className="error-output">command not found: <strong>{command}</strong>. Try <button type="button" onClick={() => execute("help")}>help</button>.</p>}
                </div>
              </div>
            ))}

            {initialCommand && (
              <div className="route-command"><div className="command-echo"><span className="prompt-mark">&gt;</span><span>{promptPath} $</span><strong>{initialCommand}</strong></div></div>
            )}
            <div className="route-output">{children}</div>
            <div ref={terminalEnd} />
          </div>

          <form className="command-form" onSubmit={onSubmit}>
            <span className="prompt-mark">&gt;</span><span className="input-path">{promptPath} $</span>
            <input aria-label="Terminal command" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} placeholder="type a command..." autoComplete="off" spellCheck={false} />
          </form>
          <div className="suggestion-bar"><span className="suggestion-label">TRY</span>{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => execute(suggestion)}>{suggestion}</button>)}</div>
        </div>
      </section>
    </main>
  );
}

function commandForPath(pathname: string) {
  if (pathname === "/skills") return "cd skills && ls";
  if (pathname === "/projects") return "cd projects && ls";
  if (pathname.startsWith("/projects/")) return `cd projects && cat ${pathname.split("/").pop()}`;
  if (pathname === "/experience") return "cd experience && ls";
  if (pathname === "/blogs") return "cd blogs && ls";
  if (pathname.startsWith("/blogs/")) return `cd blogs && cat ${pathname.split("/").pop()}`;
  if (pathname === "/about") return "about";
  if (pathname === "/resume") return "cat skills experience projects";
  return undefined;
}

function HelpOutput() {
  return <div className="help-output"><p className="output-intro">A small, friendly command set. You can also use the links above.</p><div className="command-list"><div><code>about</code><span>read a little about me</span></div><div><code>ls</code><span>see what is here</span></div><div><code>cd projects</code><span>explore selected work</span></div><div><code>cd experience</code><span>see where I have been</span></div><div><code>cd blogs</code><span>read field notes and essays</span></div><div><code>resume</code><span>open the quick overview</span></div><div><code>clear</code><span>clear terminal-only output</span></div></div></div>;
}

function CoffeeOutput() {
  return <div className="coffee-output"><span className="coffee-cup" aria-hidden="true">[coffee]</span><div><strong>Brewing a fresh cup...</strong><p>Permission granted. Good ideas incoming.</p></div></div>;
}
