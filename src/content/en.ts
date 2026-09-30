import type { Content } from './types'

export const en: Content = {
  meta: {
    title: 'Mohammed Jawoad | Senior ERP Consultant and Odoo Developer',
    description:
      'SAP Business One, SAP S/4HANA, Odoo and ERPNext consultant and developer in Baghdad. Implementation, custom apps connected to SAP, financial reporting and consolidation, and ongoing support.',
  },
  nav: {
    brand: 'Mohammed Jawoad',
    home: 'Mohammed Jawoad, back to top',
    skip: 'Skip to content',
    primary: 'Main',
    links: [
      { id: 'projects', label: 'Projects' },
      { id: 'experience', label: 'Experience' },
      { id: 'services', label: 'Services' },
      { id: 'process', label: 'Process' },
      { id: 'contact', label: 'Contact' },
    ],
    cta: 'Get in touch',
    langSwitch: 'العربية',
    langSwitchAria: 'Switch to Arabic',
    menu: 'Menu',
    close: 'Close menu',
  },
  hero: {
    status: 'Open to ERP consultant roles and consulting projects',
    nameLines: ['Mohammed', 'Jawoad'],
    altName: 'محمد جواد',
    role: 'Senior ERP consultant and Odoo developer',
    pitch:
      'I implement SAP Business One, SAP S/4HANA, Odoo and ERPNext, and build the approvals, portals and reports your team needs around them, so finance and operations work from the same numbers.',
    ctaPrimary: 'Download CV',
    ctaSecondary: 'See my projects',
    platforms: ['SAP Business One', 'SAP S/4HANA', 'SAP HANA', 'Odoo', 'ERPNext'],
    scroll: 'Scroll',
  },
  ledger: {
    title: 'Results, reconciled',
    intro: 'Figures from delivered work, checked the way finance checks a statement.',
    rows: [
      { label: 'Years in IT and ERP', value: 8, suffix: '+' },
      { label: 'SAP-integrated applications built', value: 7 },
      { label: 'Companies consolidated into one portal for the finance manager', value: 7 },
      { label: 'Financial reports automated on SAP HANA', value: 54 },
    ],
    total: { label: 'Closed-month checks matched to the cent', value: 23, suffix: ' / 23' },
    stamp: 'Balanced',
  },
  services: {
    title: 'What I can do for your company',
    intro:
      'Pick one service or combine them. Every engagement covers the business process as well as the system.',
    whatYouGet: 'What you get',
    tools: 'Tools',
    cta: 'Discuss this service',
    items: [
      {
        id: 'sap',
        name: 'SAP Business One and S/4HANA',
        short: 'SAP Business One or S/4HANA',
        summary:
          'Consulting and implementation on SAP Business One and SAP S/4HANA across finance, procurement, sales, inventory and production, from requirements through configuration, UAT, go-live and user training.',
        outcomes: [
          'Your processes mapped and configured in SAP',
          'Approval procedures, user-defined fields and Transaction Notification controls that keep data clean',
          'A supported go-live with trained users and clear documentation',
        ],
        tools: ['SAP S/4HANA', 'SAP B1 10.0 on HANA', 'Crystal Reports', 'B1if', 'SAP Customer Checkout'],
      },
      {
        id: 'odoo',
        name: 'Odoo implementation and custom modules',
        short: 'Odoo',
        summary:
          'Odoo Community or Enterprise configured for how your company works, with custom modules where the standard apps stop.',
        outcomes: [
          'Accounting, sales, purchasing and inventory set up for your processes',
          'Custom modules built to Odoo conventions',
          'Requirements, testing and go-live support',
        ],
        tools: ['Odoo Community', 'Odoo Enterprise', 'Custom modules', 'PostgreSQL'],
      },
      {
        id: 'erpnext',
        name: 'ERPNext implementation',
        short: 'ERPNext',
        summary:
          'Accounting, buying, selling, stock and manufacturing configured around the way your company already runs.',
        outcomes: [
          'Workflows configured from your real processes',
          'Testing and UAT with your process owners',
          'User training and process documentation',
        ],
        tools: ['ERPNext', 'Accounting', 'Stock', 'Manufacturing'],
      },
      {
        id: 'apps',
        name: 'Custom apps connected to SAP',
        short: 'Custom app or integration',
        summary:
          'Web and mobile apps that read from and post to SAP Business One through the Service Layer and HANA, replacing paper forms, spreadsheets and manual approvals.',
        outcomes: [
          'Approvals on mobile with push notifications',
          'Journal entries, payments and transfers posted straight to SAP',
          'Arabic and English interfaces with role-based access and audit trails',
        ],
        tools: ['SAP Service Layer', 'SAP HANA', 'TypeScript', 'React', 'Node.js'],
      },
      {
        id: 'reporting',
        name: 'Financial reporting and consolidation',
        short: 'Reporting and consolidation',
        summary:
          "Trial balance, financial position, income statement and sales reporting across companies, branches and currencies, validated against finance's closed months.",
        outcomes: [
          'Multi-company, multi-currency consolidation in IQD and USD',
          'Crystal, SQL and HANA reports your managers can rely on',
          'Excel and PDF exports with an audit trail',
        ],
        tools: ['SAP HANA', 'SQL Server', 'Crystal Reports', 'Stored procedures'],
      },
      {
        id: 'infra',
        name: 'Hosting, security and support',
        short: 'Hosting and support',
        summary:
          'The servers, access control and backups your ERP depends on, set up properly and looked after so the system stays available.',
        outcomes: [
          'Windows Server and Linux administration',
          'TLS, Cloudflare Tunnel and role-based access with audit logs',
          'Backup, disaster recovery and health monitoring',
        ],
        tools: ['Windows Server', 'Linux', 'Caddy', 'Cloudflare Tunnel', 'Docker'],
      },
    ],
  },
  engagements: {
    title: 'Ways to work together',
    intro: 'Start with what you need now and add more later.',
    bestFor: 'Best for',
    items: [
      {
        icon: 'implement',
        name: 'ERP implementation',
        body: 'A fixed-scope project to take SAP Business One, Odoo or ERPNext live: discovery, configuration, testing, go-live and training.',
        fit: 'Companies moving off spreadsheets or an old system',
      },
      {
        icon: 'build',
        name: 'Custom development',
        body: 'A portal, approval flow, integration or report pack built around the ERP you already run.',
        fit: 'Teams whose ERP works but who still rely on manual steps',
      },
      {
        icon: 'support',
        name: 'Ongoing support',
        body: 'A monthly arrangement covering administration, fixes, small changes, user support and system health.',
        fit: 'Companies that want one accountable person after go-live',
      },
    ],
  },
  projects: {
    title: 'Seven applications for one group',
    intro:
      'Built for Al-Rafidain Group companies on SAP Business One. Each one replaced a manual step or a legacy report.',
    resultsLabel: 'Results',
    stackLabel: 'Built with',
    flowLabel: 'How it connects',
    caseStudies: 'Read the full case studies on GitHub',
    items: [
      {
        name: 'Group Finance Manager Portal',
        client: 'Group finance manager, seven companies',
        summary:
          'Consolidates trial balance, financial position, income statement and daily sales for seven SAP Business One companies in IQD and USD, in an Arabic-first interface.',
        results: [
          '54 financial reports automated on SAP HANA',
          "23 of 23 validation checks matched finance's closed months to the cent",
        ],
        stack: ['SAP HANA', 'Node.js', 'Express', 'React', 'TypeScript'],
        flow: ['Seven SAP B1 companies', 'SAP HANA', 'Consolidation API', 'Finance manager portal'],
      },
      {
        name: 'Operations and Finance Monitoring Platform',
        client: 'Airport transport company',
        summary:
          'Replaced 27 legacy reports with 20 role-based Arabic and English workspaces, fed by SAP Business One and SAP Customer Checkout.',
        results: ['10 access roles, audit-logged evidence exports and certificate-validated connections'],
        stack: ['SAP Service Layer', 'SAP Customer Checkout', 'B1if', 'PostgreSQL', 'React'],
        flow: ['SAP B1 and Customer Checkout', 'Service Layer and B1if', 'PostgreSQL', '20 role-based workspaces'],
      },
      {
        name: 'AP Payment Approval Portal',
        client: 'Pharmaceutical company',
        summary:
          'The finance team submits payment requests against open SAP AP invoices, and the finance manager approves or rejects them on mobile with push notifications.',
        results: [
          'Supplier payment approval moved from paper to mobile',
          'Every approved request traced to its SAP outgoing payment',
        ],
        stack: ['SAP Service Layer', 'Node.js', 'React PWA', 'SQL Server', 'Web Push'],
        flow: ['Open AP invoices', 'Payment request', 'Finance manager approval on mobile', 'SAP outgoing payment'],
      },
      {
        name: 'Finance Posting Portal',
        client: 'Car rental company',
        summary:
          'Posts journal entries, incoming payments (including partial and cross-branch), fund transfers and commissions to SAP, with fleet profit-center reporting.',
        results: ['Recoverable drafts and role controls for finance staff'],
        stack: ['SAP Service Layer', 'Hono', 'tRPC', 'React', 'SQL Server'],
        flow: ['Finance team', 'Validated draft', 'SAP Service Layer', 'Journal entries and payments'],
      },
      {
        name: 'Fleet and Sales Applications',
        client: 'Fleet and sales teams',
        summary:
          'A vehicle-accident memo workflow with driver submission, SAP attachments and manager approval, plus a sales and invoice reporting portal.',
        results: [
          'Accident memos submitted by drivers and approved by managers, stored as SAP attachments',
          'Sales and invoice reports with Crystal Reports, Excel and PDF export',
        ],
        stack: ['SAP Service Layer', 'SAP API Gateway', 'Crystal Reports', 'Node.js', 'React'],
        flow: ['Driver submission', 'Manager approval', 'SAP attachments', 'Reports and exports'],
      },
      {
        name: 'Smart Enterprise Workspace',
        client: 'Pharmaceutical company',
        summary:
          'An Arabic-first workspace that brings planning and production, batch tracing, finance, approvals, inventory and executive views into one place, with smart notifications.',
        results: [
          'Planning and production connected to finance, inventory and approvals',
          'Smart notifications that alert the right people when something needs action',
        ],
        stack: ['React', 'TypeScript', 'Vitest', 'Playwright', 'GitHub Actions'],
        flow: ['Planning and production', 'Batch tracing and inventory', 'Finance and approvals', 'Smart notifications'],
      },
    ],
  },
  process: {
    title: 'How a project runs',
    intro: 'A clear sequence, agreed at the start, so you always know what happens next.',
    steps: [
      {
        name: 'Discover',
        body: 'We walk through your processes, reports and pain points with the people who do the work.',
      },
      {
        name: 'Design',
        body: 'You get a written scope: what gets configured, what gets built, the timeline and the cost.',
      },
      {
        name: 'Build and configure',
        body: 'I configure the ERP and build the extensions, with test cases agreed in advance.',
      },
      {
        name: 'Test and go live',
        body: 'Your team runs UAT on real scenarios before the switch, and I support the go-live.',
      },
      {
        name: 'Train and support',
        body: 'Users get training and documentation, and you keep a direct line to me afterwards.',
      },
    ],
  },
  experience: {
    title: 'Experience',
    intro: 'Eight years across ERP consulting, development and the infrastructure underneath.',
    roles: [
      {
        company: 'Al-Rafidain Group',
        place: 'Baghdad, Iraq',
        period: 'Mar 2023 – Sep 2026',
        title: 'SAP Business One Consultant and Group Systems Administrator',
        context:
          'A multi-company group in pharmaceuticals, airport transport, car rental and family entertainment, running SAP Business One on HANA across more than seven companies.',
        points: [
          'Designed and built seven SAP-integrated web applications for group finance, operations and leadership, replacing legacy reports and manual approvals.',
          'Led SAP Business One consulting across finance, procurement, sales, inventory and production, from requirements and solution design through configuration, UAT, go-live and training.',
          'Enforced data quality with Transaction Notification controls, approval procedures, stored procedures, user-defined fields and custom Crystal and SQL reports.',
          "Ran the group's portals in production on Windows Server with Caddy, Cloudflare Tunnel, TLS, watchdogs and health checks, plus backup and disaster recovery.",
        ],
      },
      {
        company: 'Al-Qalab',
        place: 'Iraq',
        period: 'Jan 2022 – Mar 2023',
        title: 'ERPNext Functional and Technical Consultant',
        points: [
          'Implemented and optimized ERPNext across accounting, buying, selling, stock and manufacturing.',
          'Gathered requirements with process owners, configured workflows and led testing and UAT through go-live.',
          'Trained users and wrote process documentation, improving adoption and data accuracy.',
        ],
      },
      {
        company: 'NetGate-Iraq',
        place: 'Baghdad, Iraq',
        period: 'Jun 2018 – Jan 2022',
        title: 'Senior System Administrator',
        points: [
          'Administered Windows and Linux servers, virtualization and networks, with monitoring, backup and recovery.',
          'Deployed and upgraded servers and virtualization platforms, and hardened security and access control across the data center.',
          'Supported ERP and business application rollouts with configuration, troubleshooting and user support.',
        ],
      },
    ],
    educationLabel: 'Education',
    education: {
      degree: 'B.Sc. in Computer Engineering',
      school: 'Al-Mustansiriyah University, Baghdad',
      year: '2018',
    },
  },
  about: {
    title: 'About me',
    paragraphs: [
      "I'm an ERP consultant and developer based in Baghdad. I started out running servers and networks, moved into ERPNext implementation, and then led SAP Business One for a group running more than seven companies on it.",
      "Clients get both sides from one person: enough finance, procurement and inventory knowledge to design the process, and the engineering to build what the standard system doesn't do.",
      "It's fitting work for someone from Iraq. The oldest written records we have, pressed into clay in southern Mesopotamia more than 5,000 years ago, are accounts.",
    ],
    facts: [
      { label: 'Based in', value: 'Baghdad, Iraq' },
      { label: 'Languages', value: 'Arabic (native), English (professional working proficiency)' },
      { label: 'Education', value: 'B.Sc. Computer Engineering, Al-Mustansiriyah University' },
      { label: 'Works', value: 'On-site in Iraq and remotely' },
    ],
    toolsTitle: 'Tools and platforms',
    toolGroups: [
      {
        name: 'SAP',
        items: [
          'SAP S/4HANA',
          'SAP B1 10.0 on HANA',
          'Service Layer (REST/OData)',
          'API Gateway',
          'B1if',
          'SAP Customer Checkout',
          'Transaction Notification',
          'Approval procedures',
          'User-defined fields',
          'Crystal Reports',
        ],
      },
      {
        name: 'Odoo and ERPNext',
        items: ['Odoo Community', 'Odoo Enterprise', 'Custom Odoo modules', 'ERPNext'],
      },
      {
        name: 'Finance and operations',
        items: [
          'General ledger',
          'AP and AR',
          'Incoming and outgoing payments',
          'Journal entries',
          'Profit centers',
          'Multi-branch',
          'Multi-company consolidation',
          'Multi-currency (IQD/USD)',
          'Procurement',
          'Sales',
          'Inventory',
          'Production',
        ],
      },
      {
        name: 'Development',
        items: [
          'TypeScript',
          'JavaScript',
          'Node.js',
          'Express',
          'Hono',
          'tRPC',
          'React',
          'REST APIs',
          'SAP HANA SQL',
          'SQL Server',
          'PostgreSQL',
          'Stored procedures',
        ],
      },
      {
        name: 'Infrastructure and security',
        items: [
          'Windows Server',
          'Linux',
          'Caddy',
          'Cloudflare Tunnel',
          'TLS/HTTPS',
          'Role-based access',
          'Audit logging',
          'Backup and disaster recovery',
          'Virtualization',
          'Networking',
        ],
      },
    ],
  },
  faq: {
    title: 'Common questions',
    items: [
      {
        q: 'Are you open to full-time roles?',
        a: "Yes. I'm open to on-site and hybrid ERP consultant roles, and to consulting projects. You can download my CV at the top of this page or message me directly.",
      },
      {
        q: 'Which ERP is right for my company?',
        a: "It depends on your size, budget and how much customization you need. SAP Business One suits growing companies that want a proven system with strong finance controls. SAP S/4HANA fits larger enterprises that need the full SAP suite. Odoo is modular and flexible. ERPNext is open source with a low license cost. I'll give you an honest recommendation after a short discovery call.",
      },
      {
        q: 'Can you take over an SAP Business One system someone else implemented?',
        a: 'Yes. I start by reviewing the configuration, reports and controls, fix what is urgent, and then improve the rest step by step.',
      },
      {
        q: 'Can you connect SAP Business One to our other systems?',
        a: 'Yes. I build integrations and apps on the SAP Service Layer and HANA, so data moves without re-typing and approvals happen where your people are.',
      },
      {
        q: 'Do you work with companies outside Baghdad?',
        a: 'Yes. I work on-site in Iraq and remotely for clients elsewhere. Most of the work, including configuration, development and training, can be done remotely.',
      },
      {
        q: 'Do you train our staff?',
        a: 'Yes. Every project includes user training and written documentation, in Arabic or English.',
      },
      {
        q: 'How do we start?',
        a: "Send a short message about your company and what you need. I'll reply with questions or a time for a call, then a written proposal with scope, timeline and cost.",
      },
    ],
  },
  contact: {
    title: 'Hiring for an ERP role, or planning a project?',
    intro:
      "Share a few details about the role, or about your company and the problem you want solved. I'll reply with questions or a time for a call.",
    form: {
      title: 'Your message',
      nameLabel: 'Your name',
      namePlaceholder: 'Full name',
      companyLabel: 'Company',
      companyPlaceholder: 'Company name',
      needLabel: 'What is it about?',
      needRole: 'A job opportunity',
      needOther: 'Something else',
      messageLabel: 'Details',
      messagePlaceholder: 'The role, or what you want to improve and by when',
      sendWhatsapp: 'Send on WhatsApp',
      sendEmail: 'Send by email',
      note: "Both buttons open your own WhatsApp or email app with the message filled in. This site doesn't store anything.",
      error: 'Add a few words or pick a topic first.',
      greeting: 'Hello Mohammed,',
      subject: 'Inquiry',
      keys: { name: 'Name', company: 'Company', need: 'Need' },
    },
    direct: {
      title: 'Reach me directly',
      email: 'Email',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
      linkedinValue: 'Connect on LinkedIn',
      cv: 'CV',
      cvValue: 'Download PDF',
      caseStudies: 'Case studies',
      caseStudiesValue: 'Read on GitHub',
      location: 'Location',
      locationValue: 'Baghdad, Iraq',
    },
  },
  footer: {
    tagline: 'SAP Business One, SAP S/4HANA, Odoo and ERPNext consulting and development.',
    top: 'Back to top',
  },
  float: {
    whatsapp: 'Message me on WhatsApp',
  },
}
