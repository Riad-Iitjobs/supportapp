// Dummy data for Admin Dashboard

// Users data
const DUMMY_USERS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    initials: 'SJ',
    status: 'active',
    ticketCount: 3
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    initials: 'MC',
    status: 'pending',
    ticketCount: 2
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    initials: 'ER',
    status: 'active',
    ticketCount: 5
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@example.com',
    initials: 'DK',
    status: 'active',
    ticketCount: 1
  },
  {
    id: 5,
    name: 'Jessica Martinez',
    email: 'jessica.m@example.com',
    initials: 'JM',
    status: 'pending',
    ticketCount: 4
  },
  {
    id: 6,
    name: 'Robert Taylor',
    email: 'robert.t@example.com',
    initials: 'RT',
    status: 'active',
    ticketCount: 2
  },
  {
    id: 7,
    name: 'Amanda White',
    email: 'amanda.white@example.com',
    initials: 'AW',
    status: 'active',
    ticketCount: 1
  },
  {
    id: 8,
    name: 'James Anderson',
    email: 'james.a@example.com',
    initials: 'JA',
    status: 'pending',
    ticketCount: 3
  }
];

// Tickets data
const DUMMY_TICKETS = [
  // Sarah Johnson's tickets
  {
    id: 101,
    userId: 1,
    subject: 'Cannot login to my account',
    category: 'technical',
    status: 'open',
    date: '2026-01-04 09:30 AM',
    priority: 'high'
  },
  {
    id: 102,
    userId: 1,
    subject: 'Billing issue with last invoice',
    category: 'billing',
    status: 'in-progress',
    date: '2026-01-03 02:15 PM',
    priority: 'medium'
  },
  {
    id: 103,
    userId: 1,
    subject: 'Feature request: Dark mode',
    category: 'feature',
    status: 'resolved',
    date: '2026-01-01 11:00 AM',
    priority: 'low'
  },

  // Michael Chen's tickets
  {
    id: 104,
    userId: 2,
    subject: 'App crashes on startup',
    category: 'bug',
    status: 'open',
    date: '2026-01-04 10:45 AM',
    priority: 'urgent'
  },
  {
    id: 105,
    userId: 2,
    subject: 'Password reset not working',
    category: 'technical',
    status: 'in-progress',
    date: '2026-01-03 04:20 PM',
    priority: 'high'
  },

  // Emily Rodriguez's tickets
  {
    id: 106,
    userId: 3,
    subject: 'Question about pricing plans',
    category: 'billing',
    status: 'resolved',
    date: '2026-01-04 08:00 AM',
    priority: 'low'
  },
  {
    id: 107,
    userId: 3,
    subject: 'Data export not downloading',
    category: 'technical',
    status: 'open',
    date: '2026-01-03 03:30 PM',
    priority: 'medium'
  },
  {
    id: 108,
    userId: 3,
    subject: 'Email notifications stopped',
    category: 'bug',
    status: 'in-progress',
    date: '2026-01-02 01:15 PM',
    priority: 'medium'
  },
  {
    id: 109,
    userId: 3,
    subject: 'Add team collaboration feature',
    category: 'feature',
    status: 'closed',
    date: '2025-12-30 09:00 AM',
    priority: 'low'
  },
  {
    id: 110,
    userId: 3,
    subject: 'Mobile app performance slow',
    category: 'technical',
    status: 'resolved',
    date: '2025-12-28 02:45 PM',
    priority: 'high'
  },

  // David Kim's tickets
  {
    id: 111,
    userId: 4,
    subject: 'Need help setting up API',
    category: 'technical',
    status: 'in-progress',
    date: '2026-01-04 11:20 AM',
    priority: 'medium'
  },

  // Jessica Martinez's tickets
  {
    id: 112,
    userId: 5,
    subject: 'Charged twice for subscription',
    category: 'billing',
    status: 'open',
    date: '2026-01-04 07:30 AM',
    priority: 'urgent'
  },
  {
    id: 113,
    userId: 5,
    subject: 'Profile picture upload failed',
    category: 'bug',
    status: 'open',
    date: '2026-01-03 05:45 PM',
    priority: 'low'
  },
  {
    id: 114,
    userId: 5,
    subject: 'Integration with Slack',
    category: 'feature',
    status: 'resolved',
    date: '2026-01-02 10:00 AM',
    priority: 'medium'
  },
  {
    id: 115,
    userId: 5,
    subject: 'Search function not working',
    category: 'technical',
    status: 'closed',
    date: '2025-12-31 03:20 PM',
    priority: 'high'
  },

  // Robert Taylor's tickets
  {
    id: 116,
    userId: 6,
    subject: 'Dashboard widgets missing',
    category: 'bug',
    status: 'in-progress',
    date: '2026-01-03 12:30 PM',
    priority: 'medium'
  },
  {
    id: 117,
    userId: 6,
    subject: 'Export to PDF broken',
    category: 'technical',
    status: 'resolved',
    date: '2026-01-01 09:15 AM',
    priority: 'low'
  },

  // Amanda White's tickets
  {
    id: 118,
    userId: 7,
    subject: 'Cannot delete old messages',
    category: 'bug',
    status: 'open',
    date: '2026-01-04 01:00 PM',
    priority: 'low'
  },

  // James Anderson's tickets
  {
    id: 119,
    userId: 8,
    subject: 'Account upgrade not reflecting',
    category: 'billing',
    status: 'in-progress',
    date: '2026-01-04 08:45 AM',
    priority: 'high'
  },
  {
    id: 120,
    userId: 8,
    subject: '2FA setup issues',
    category: 'technical',
    status: 'open',
    date: '2026-01-03 11:30 AM',
    priority: 'medium'
  },
  {
    id: 121,
    userId: 8,
    subject: 'Request custom domain support',
    category: 'feature',
    status: 'closed',
    date: '2025-12-29 02:00 PM',
    priority: 'low'
  }
];

// Chat messages data
const DUMMY_CHAT_MESSAGES = [
  // Sarah Johnson's chat
  {
    id: 1,
    userId: 1,
    sender: 'user',
    message: 'Hi, I am having trouble logging into my account',
    time: '09:15 AM'
  },
  {
    id: 2,
    userId: 1,
    sender: 'support',
    message: 'Hello Sarah! I can help you with that. Can you tell me what error message you are seeing?',
    time: '09:16 AM'
  },
  {
    id: 3,
    userId: 1,
    sender: 'user',
    message: 'It says "Invalid credentials" but I am sure my password is correct',
    time: '09:17 AM'
  },
  {
    id: 4,
    userId: 1,
    sender: 'support',
    message: 'Let me check your account status. Have you recently changed your password?',
    time: '09:18 AM'
  },
  {
    id: 5,
    userId: 1,
    sender: 'user',
    message: 'No, I have been using the same password for months',
    time: '09:19 AM'
  },

  // Michael Chen's chat
  {
    id: 6,
    userId: 2,
    sender: 'user',
    message: 'The app keeps crashing when I try to open it',
    time: '10:30 AM'
  },
  {
    id: 7,
    userId: 2,
    sender: 'support',
    message: 'I am sorry to hear that. What device and operating system are you using?',
    time: '10:31 AM'
  },
  {
    id: 8,
    userId: 2,
    sender: 'user',
    message: 'iPhone 13, iOS 17.2',
    time: '10:32 AM'
  },
  {
    id: 9,
    userId: 2,
    sender: 'support',
    message: 'Thank you. Have you tried uninstalling and reinstalling the app?',
    time: '10:33 AM'
  },

  // Emily Rodriguez's chat
  {
    id: 10,
    userId: 3,
    sender: 'user',
    message: 'Hello, I need to export my data but the download button is not working',
    time: 'Yesterday 3:25 PM'
  },
  {
    id: 11,
    userId: 3,
    sender: 'support',
    message: 'Hi Emily! What format are you trying to export to?',
    time: 'Yesterday 3:26 PM'
  },
  {
    id: 12,
    userId: 3,
    sender: 'user',
    message: 'CSV format. I click the button but nothing happens',
    time: 'Yesterday 3:27 PM'
  },
  {
    id: 13,
    userId: 3,
    sender: 'support',
    message: 'Let me look into this for you. Are you seeing any error messages?',
    time: 'Yesterday 3:28 PM'
  },
  {
    id: 14,
    userId: 3,
    sender: 'user',
    message: 'No error messages, the button just does not respond',
    time: 'Yesterday 3:29 PM'
  },

  // David Kim's chat
  {
    id: 15,
    userId: 4,
    sender: 'user',
    message: 'I need assistance setting up the API integration',
    time: '11:10 AM'
  },
  {
    id: 16,
    userId: 4,
    sender: 'support',
    message: 'Of course! What specific part of the API setup do you need help with?',
    time: '11:11 AM'
  },
  {
    id: 17,
    userId: 4,
    sender: 'user',
    message: 'How do I generate an API key?',
    time: '11:12 AM'
  },

  // Jessica Martinez's chat
  {
    id: 18,
    userId: 5,
    sender: 'user',
    message: 'I was charged twice for my subscription this month!',
    time: '07:20 AM'
  },
  {
    id: 19,
    userId: 5,
    sender: 'support',
    message: 'I apologize for the inconvenience. Let me check your billing history right away.',
    time: '07:22 AM'
  },
  {
    id: 20,
    userId: 5,
    sender: 'user',
    message: 'Thank you, I really need this resolved quickly',
    time: '07:23 AM'
  },
  {
    id: 21,
    userId: 5,
    sender: 'support',
    message: 'I understand. I can see the duplicate charge. We will process a refund within 24 hours.',
    time: '07:25 AM'
  },

  // Robert Taylor's chat
  {
    id: 22,
    userId: 6,
    sender: 'user',
    message: 'Some widgets are missing from my dashboard',
    time: 'Yesterday 12:20 PM'
  },
  {
    id: 23,
    userId: 6,
    sender: 'support',
    message: 'Which widgets are you not seeing?',
    time: 'Yesterday 12:21 PM'
  },
  {
    id: 24,
    userId: 6,
    sender: 'user',
    message: 'The analytics and recent activity widgets',
    time: 'Yesterday 12:22 PM'
  },

  // Amanda White's chat
  {
    id: 25,
    userId: 7,
    sender: 'user',
    message: 'I cannot seem to delete my old messages',
    time: '12:50 PM'
  },
  {
    id: 26,
    userId: 7,
    sender: 'support',
    message: 'Let me help you with that. Are you trying to delete individual messages or entire conversations?',
    time: '12:51 PM'
  },

  // James Anderson's chat
  {
    id: 27,
    userId: 8,
    sender: 'user',
    message: 'I upgraded my account yesterday but I still see the basic plan',
    time: '08:30 AM'
  },
  {
    id: 28,
    userId: 8,
    sender: 'support',
    message: 'Hi James! Let me verify your account upgrade status.',
    time: '08:31 AM'
  },
  {
    id: 29,
    userId: 8,
    sender: 'user',
    message: 'I paid for the premium plan and got the confirmation email',
    time: '08:32 AM'
  },
  {
    id: 30,
    userId: 8,
    sender: 'support',
    message: 'I can see your payment was processed. It may take up to an hour for the upgrade to reflect. Please try logging out and back in.',
    time: '08:34 AM'
  }
];
