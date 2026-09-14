import Link from "next/link";

export default function NotFound() {
  return <div className="error-output"><strong>404</strong> path not found. Try <Link href="/">ls</Link> to return to the workspace.</div>;
}
