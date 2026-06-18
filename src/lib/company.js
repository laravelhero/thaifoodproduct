/**
 * Single source of truth for company contact details.
 * Update here and it changes everywhere it's used.
 */
export const company = {
  name: 'International Thai Food and Beverage Ltd.',
  address: '748, BFIDC Road, Kalurghat Heavy I/A, Chandgaon, Chittagong, Bangladesh',
  office: '+880 2334471619',
  local: { cell: '+880 1844538504', email: 'info@bd-itfbl.com' },
  exportContact: { cell: '+880 1977 764311', email: 'thaifood81@gmail.com' },
  hours: '9.00 AM – 6.00 PM',
};

/** Strip spaces for tel: hrefs. */
export const tel = (n) => 'tel:' + n.replace(/\s+/g, '');
