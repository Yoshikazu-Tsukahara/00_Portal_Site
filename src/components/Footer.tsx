export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-zinc-200/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 py-10 text-center sm:px-8">
        <p className="text-sm text-zinc-500">
          &copy; {year} My Tool Box. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
