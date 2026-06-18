/**
 * Alpine entrypoint — registered before Alpine starts (via @astrojs/alpinejs).
 * Define reusable components here so their JS lives in a real module
 * (no HTML-attribute escaping pitfalls with quotes, backticks, newlines, &).
 */
export default (Alpine) => {
  Alpine.data('contactForm', () => ({
    name: '',
    email: '',
    phone: '',
    message: '',
    answer: '',
    a: 0,
    b: 0,
    error: '',
    sent: false,

    roll() {
      this.a = Math.floor(Math.random() * 9) + 1;
      this.b = Math.floor(Math.random() * 9) + 1;
      this.answer = '';
    },

    init() {
      this.roll();
    },

    submit() {
      if (!this.name || !this.email || !this.phone || !this.message) return;
      if (parseInt(this.answer, 10) !== this.a + this.b) {
        this.error = 'Incorrect answer — please try again.';
        this.roll();
        return;
      }
      this.error = '';
      this.sent = true;

      const body =
        `${this.message}\n\n` +
        `Name: ${this.name}\n` +
        `Email: ${this.email}\n` +
        `Phone: ${this.phone}`;

      const subject = `Website enquiry from ${this.name}`;
      window.location.href =
        `mailto:info@bd-itfbl.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },
  }));
};
