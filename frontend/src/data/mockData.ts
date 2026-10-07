export interface User {
  id: string;
  name: string;
  email: string;
  type: 'student';
  gender?: 'male' | 'female';
  budget?: number;
  moveInDate?: string;
  location?: string;
  cleanliness?: number;
  sleepSchedule?: string;
  noise?: number;
  social?: number;
  preferences?: string[];
  bio?: string;
  image?: string;
  university?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  recipientName: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImage: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

/** ISO date string N days from today - keeps demo move-in dates relevant. */
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export const mockData = {
  universities: [
    { name: 'UNILAG (University of Lagos)', city: 'Lagos', areas: ['Akoka', 'Ikoyi', 'Yaba', 'Surulere'] },
    { name: 'OAU (Obafemi Awolowo University)', city: 'Ile-Ife', areas: ['Ile-Ife', 'Osun State'] },
    { name: 'UI (University of Ibadan)', city: 'Ibadan', areas: ['Ibadan', 'Oyo State'] },
    { name: 'LAUTECH (Ladoke Akintola University)', city: 'Ogbomoso', areas: ['Ogbomoso', 'Oyo State'] },
    { name: 'Poly Ibadan (Polytechnic Ibadan)', city: 'Ibadan', areas: ['Ibadan', 'Oyo State'] },
    { name: 'UNIILORIN (University of Ilorin)', city: 'Ilorin', areas: ['Ilorin', 'Kwara State'] },
    { name: 'UNIBEN (University of Benin)', city: 'Benin City', areas: ['Benin City', 'Edo State'] },
    { name: 'ABU (Ahmadu Bello University)', city: 'Zaria', areas: ['Zaria', 'Kaduna State'] },
    { name: 'UNIZIK (Nnamdi Azikiwe University)', city: 'Awka', areas: ['Awka', 'Anambra State'] },
    { name: 'LASPOTECH (Lagos State Polytechnic)', city: 'Lagos', areas: ['Ikorodu', 'Lagos Island', 'Yaba'] },
    { name: 'OOU (Olabisi Onabanjo University)', city: 'Abeokuta', areas: ['Abeokuta', 'Ogun State'] },
    { name: 'FUTO (Federal University of Technology)', city: 'Owerri', areas: ['Owerri', 'Imo State'] }
  ],
  students: [
    {
      id: 's1',
      name: 'Chioma Okafor',
      email: 'chioma@unilag.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'UNILAG',
      budget: 250000,
      moveInDate: '2024-08-15',
      location: 'Ikoyi, Lagos',
      cleanliness: 9,
      sleepSchedule: 'early',
      noise: 6,
      social: 7,
      preferences: ['Quiet', 'Clean', 'Social'],
      bio: 'Engineering student at UNILAG, love studying and exploring Lagos on weekends',
      image: 'https://via.placeholder.com/150?text=Chioma'
    },
    {
      id: 's2',
      name: 'Adeyinka Johnson',
      email: 'adeyinka@ui.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'UI',
      budget: 280000,
      moveInDate: '2024-08-15',
      location: 'Ibadan',
      cleanliness: 7,
      sleepSchedule: 'night',
      noise: 8,
      social: 8,
      preferences: ['Social', 'Music', 'Gaming'],
      bio: 'CS student, night owl, love gaming and hanging with friends',
      image: 'https://via.placeholder.com/150?text=Adeyinka'
    },
    {
      id: 's3',
      name: 'Ngozi Anyanwu',
      email: 'ngozi@ku.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'UNIILORIN',
      budget: 220000,
      moveInDate: '2024-08-20',
      location: 'Ilorin',
      cleanliness: 10,
      sleepSchedule: 'early',
      noise: 3,
      social: 5,
      preferences: ['Clean', 'Quiet', 'Responsible'],
      bio: 'Biology major, studying hard, need quiet environment',
      image: 'https://via.placeholder.com/150?text=Ngozi'
    },
    {
      id: 's4',
      name: 'Tunde Adeyemi',
      email: 'tunde@laspotech.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'LASPOTECH',
      budget: 260000,
      moveInDate: '2024-09-01',
      location: 'Lagos Island',
      cleanliness: 6,
      sleepSchedule: 'mixed',
      noise: 7,
      social: 9,
      preferences: ['Social', 'Sports', 'Food'],
      bio: 'Business student, love sports and cooking, always up for fun',
      image: 'https://via.placeholder.com/150?text=Tunde'
    },
    {
      id: 's5',
      name: 'Ife Okonkwo',
      email: 'ife@uniben.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'UNIBEN',
      budget: 250000,
      moveInDate: '2024-08-15',
      location: 'Benin City',
      cleanliness: 9,
      sleepSchedule: 'early',
      noise: 4,
      social: 6,
      preferences: ['Clean', 'Quiet', 'Artistic'],
      bio: 'Art student, looking for a peaceful space to create',
      image: 'https://via.placeholder.com/150?text=Ife'
    },
    {
      id: 's6',
      name: 'Zainab Hassan',
      email: 'zainab@abu.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'ABU',
      budget: 240000,
      moveInDate: '2024-08-10',
      location: 'Zaria',
      cleanliness: 8,
      sleepSchedule: 'early',
      noise: 5,
      social: 7,
      preferences: ['Safe', 'Clean', 'Academic'],
      bio: 'Law student, very organized and focused on studies',
      image: 'https://via.placeholder.com/150?text=Zainab'
    },
    {
      id: 's7',
      name: 'Oluwaseun Oladipo',
      email: 'seun@oau.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'OAU',
      budget: 235000,
      moveInDate: '2024-08-20',
      location: 'Ile-Ife',
      cleanliness: 7,
      sleepSchedule: 'mixed',
      noise: 6,
      social: 8,
      preferences: ['Friendly', 'Active', 'Clean'],
      bio: 'Medicine student at OAU, fitness enthusiast',
      image: 'https://via.placeholder.com/150?text=Seun'
    },
    {
      id: 's8',
      name: 'Amara Obi',
      email: 'amara@lautech.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'LAUTECH',
      budget: 200000,
      moveInDate: '2024-09-05',
      location: 'Ogbomoso',
      cleanliness: 8,
      sleepSchedule: 'early',
      noise: 4,
      social: 6,
      preferences: ['Quiet', 'Study-focused', 'Safe'],
      bio: 'Agriculture student, very focused on academics',
      image: 'https://via.placeholder.com/150?text=Amara'
    },
    {
      id: 's9',
      name: 'Chinedu Okoro',
      email: 'chinedu@polyibadan.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'Poly Ibadan',
      budget: 180000,
      moveInDate: '2024-08-22',
      location: 'Ibadan',
      cleanliness: 6,
      sleepSchedule: 'night',
      noise: 7,
      social: 9,
      preferences: ['Social', 'Fun', 'Music'],
      bio: 'Engineering student, loves hanging out with friends',
      image: 'https://via.placeholder.com/150?text=Chinedu'
    },
    {
      id: 's10',
      name: 'Blessing Adebayo',
      email: 'blessing@unilag.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'UNILAG',
      budget: 270000,
      moveInDate: '2024-08-15',
      location: 'Yaba, Lagos',
      cleanliness: 9,
      sleepSchedule: 'early',
      noise: 3,
      social: 5,
      preferences: ['Quiet', 'Organized', 'Academic'],
      bio: 'Law student at UNILAG, need peaceful environment',
      image: 'https://via.placeholder.com/150?text=Blessing'
    }
  ] as User[],
  roommates: [
    {
      id: 's1',
      moveInDate: daysFromNow(12),
      name: 'Chioma Okafor',
      email: 'chioma@unilag.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'UNILAG',
      budget: 250000,
      location: 'Ikoyi, Lagos',
      cleanliness: 9,
      preferences: ['Quiet', 'Clean', 'Social'],
      bio: 'Engineering student at UNILAG',
      image: 'https://via.placeholder.com/150?text=Chioma',
      compatibility: 85
    },
    {
      id: 's2',
      moveInDate: daysFromNow(28),
      name: 'Adeyinka Johnson',
      email: 'adeyinka@ui.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'UI',
      budget: 280000,
      location: 'Ibadan',
      cleanliness: 7,
      preferences: ['Social', 'Music', 'Gaming'],
      bio: 'CS student, night owl',
      image: 'https://via.placeholder.com/150?text=Adeyinka',
      compatibility: 72
    },
    {
      id: 's3',
      moveInDate: daysFromNow(45),
      name: 'Ngozi Anyanwu',
      email: 'ngozi@ku.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'UNIILORIN',
      budget: 220000,
      location: 'Ilorin',
      cleanliness: 10,
      preferences: ['Clean', 'Quiet', 'Responsible'],
      bio: 'Biology major, studying hard',
      image: 'https://via.placeholder.com/150?text=Ngozi',
      compatibility: 78
    },
    {
      id: 's4',
      moveInDate: daysFromNow(7),
      name: 'Tunde Adeyemi',
      email: 'tunde@laspotech.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'LASPOTECH',
      budget: 260000,
      location: 'Lagos Island',
      cleanliness: 6,
      preferences: ['Social', 'Sports', 'Food'],
      bio: 'Business student, love sports',
      image: 'https://via.placeholder.com/150?text=Tunde',
      compatibility: 68
    },
    {
      id: 's7',
      moveInDate: daysFromNow(63),
      name: 'Oluwaseun Oladipo',
      email: 'seun@oau.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'OAU',
      budget: 235000,
      location: 'Ile-Ife',
      cleanliness: 7,
      preferences: ['Friendly', 'Active', 'Clean'],
      bio: 'Medicine student, fitness lover',
      image: 'https://via.placeholder.com/150?text=Seun',
      compatibility: 75
    },
    {
      id: 's8',
      moveInDate: daysFromNow(95),
      name: 'Amara Obi',
      email: 'amara@lautech.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'LAUTECH',
      budget: 200000,
      location: 'Ogbomoso',
      cleanliness: 8,
      preferences: ['Quiet', 'Study-focused', 'Safe'],
      bio: 'Agriculture student',
      image: 'https://via.placeholder.com/150?text=Amara',
      compatibility: 82
    },
    {
      id: 's9',
      moveInDate: daysFromNow(21),
      name: 'Chinedu Okoro',
      email: 'chinedu@polyibadan.edu.ng',
      type: 'student' as const,
      gender: 'male',
      university: 'Poly Ibadan',
      budget: 180000,
      location: 'Ibadan',
      cleanliness: 6,
      preferences: ['Social', 'Fun', 'Music'],
      bio: 'Engineering student at Poly Ibadan',
      image: 'https://via.placeholder.com/150?text=Chinedu',
      compatibility: 70
    },
    {
      id: 's10',
      moveInDate: daysFromNow(140),
      name: 'Blessing Adebayo',
      email: 'blessing@unilag.edu.ng',
      type: 'student' as const,
      gender: 'female',
      university: 'UNILAG',
      budget: 270000,
      location: 'Yaba, Lagos',
      cleanliness: 9,
      preferences: ['Quiet', 'Organized', 'Academic'],
      bio: 'Law student at UNILAG',
      image: 'https://via.placeholder.com/150?text=Blessing',
      compatibility: 79
    }
  ] as (User & { compatibility: number })[],
  messages: [
    {
      id: 'm1',
      senderId: 's1',
      recipientId: 's2',
      senderName: 'Chioma Okafor',
      recipientName: 'Adeyinka Johnson',
      content: 'Hi Adeyinka! I really like your profile. Are you still looking for a roommate?',
      timestamp: Date.now() - 3600000,
      read: true
    },
    {
      id: 'm2',
      senderId: 's2',
      recipientId: 's1',
      senderName: 'Adeyinka Johnson',
      recipientName: 'Chioma Okafor',
      content: 'Hey Chioma! Yes, I am! I love gaming too. When are you looking to move?',
      timestamp: Date.now() - 3500000,
      read: true
    },
    {
      id: 'm3',
      senderId: 's1',
      recipientId: 's2',
      senderName: 'Chioma Okafor',
      recipientName: 'Adeyinka Johnson',
      content: 'I am moving in August. Would you be interested in checking out a place together?',
      timestamp: Date.now() - 3400000,
      read: true
    }
  ] as Message[],
  conversations: [
    {
      id: 'conv1',
      userId: 's1',
      otherUserId: 's2',
      otherUserName: 'Adeyinka Johnson',
      otherUserImage: 'https://via.placeholder.com/150?text=Adeyinka',
      lastMessage: 'I am moving in August. Would you be interested in checking out a place together?',
      lastMessageTime: Date.now() - 3400000,
      unreadCount: 0
    },
    {
      id: 'conv2',
      userId: 's1',
      otherUserId: 's3',
      otherUserName: 'Ngozi Anyanwu',
      otherUserImage: 'https://via.placeholder.com/150?text=Ngozi',
      lastMessage: 'Thanks for connecting! Let me know more about your preferences.',
      lastMessageTime: Date.now() - 7200000,
      unreadCount: 1
    }
  ] as Conversation[]
};
