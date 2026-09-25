import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-gray-600 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Anjali Jain. All rights reserved.
        </p>

        <div className="flex items-center gap-5">
          <Link
            href="https://github.com/Anjalivk3"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            GitHub Profile
          </Link>

          <Link
            href="https://www.linkedin.com/in/contactanjalijain/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            LinkedIn Profile
          </Link>
        </div>
      </div>
    </footer>
  );
}

