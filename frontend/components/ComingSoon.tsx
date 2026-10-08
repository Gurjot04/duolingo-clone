import Link from "next/link";
import Mascot from "./Mascot";

export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Mascot mood="wink" size={150} />
      <h2>{title}</h2>
      <p>{text}</p>
      <span className="soon-pill">COMING SOON</span>
      <Link href="/" className="btn btn-green">BACK TO LEARN</Link>
    </div>
  );
}
