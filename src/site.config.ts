// Contact details used across the site. Edit here, not in the components.
export const site = {
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://mohammedjawoad.com',
  email: 'mohammedjawoad@gmail.com',
  phoneDisplay: '+964 772 550 1097',
  /** International format without "+" or spaces, as wa.me expects. */
  whatsapp: '9647725501097',
  linkedin: 'https://www.linkedin.com/in/mohammed-jawoad-219a75159',
}

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`
