export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} ninjin 🥕
        </p>
      </div>
    </footer>
  );
}
