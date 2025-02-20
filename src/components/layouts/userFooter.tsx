export function UserFooter() {
  return (
    <footer className="bg-[#8B2E2E] text-white py-8 mt-12">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Us */}
        <div>
          <h3 className="font-bold mb-4">Contact Us</h3>
          <p>contact@example.com</p>
          <p>+1 234 567 890</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="text-white hover:underline"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-white hover:underline"
              >
                Courses
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-white hover:text-opacity-80"
            >
              Facebook
            </a>
            <a
              href="#"
              className="text-white hover:text-opacity-80"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-white hover:text-opacity-80"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
