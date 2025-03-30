import { 
  users, type User, type InsertUser,
  healthStats, type HealthStats, type InsertHealthStats,
  reminders, type Reminder, type InsertReminder,
  chatMessages, type ChatMessage, type InsertChatMessage,
  appointments, type Appointment, type InsertAppointment,
  homeRemedies, type HomeRemedy, type InsertHomeRemedy,
  healthTracking, type HealthTracking, type InsertHealthTracking,
  medicineScans, type MedicineScan, type InsertMedicineScan,
  rewards, type Reward, type InsertReward,
  achievements, type Achievement, type InsertAchievement
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Health stats operations
  getHealthStats(userId: number): Promise<HealthStats | undefined>;
  createHealthStats(stats: InsertHealthStats): Promise<HealthStats>;
  updateHealthStats(id: number, stats: Partial<HealthStats>): Promise<HealthStats | undefined>;
  
  // Reminder operations
  getReminders(userId: number): Promise<Reminder[]>;
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminderData: Partial<Reminder>): Promise<Reminder | undefined>;
  completeReminder(id: number): Promise<Reminder | undefined>;
  snoozeReminder(id: number, minutes: number): Promise<Reminder | undefined>;
  
  // Chat operations
  getChatMessages(userId: number, conversationId: string): Promise<ChatMessage[]>;
  getRecentChatMessages(userId: number): Promise<ChatMessage[]>;
  getChatConversations(userId: number): Promise<{ id: string, title: string }[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Appointment operations
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Home remedy operations
  getHomeRemedies(): Promise<HomeRemedy[]>;
  getHomeRemedyById(id: number): Promise<HomeRemedy | undefined>;
  searchHomeRemedies(query: string): Promise<HomeRemedy[]>;
  createHomeRemedy(remedy: InsertHomeRemedy): Promise<HomeRemedy>;
  
  // Health tracking operations
  getHealthTrackingData(userId: number, type: string, timeRange: string): Promise<HealthTracking[]>;
  createHealthTrackingEntry(entry: InsertHealthTracking): Promise<HealthTracking>;
  
  // Medicine scan operations
  getMedicineScans(userId: number): Promise<MedicineScan[]>;
  createMedicineScan(scan: InsertMedicineScan): Promise<MedicineScan>;
  
  // Rewards operations
  getRewards(userId: number): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  
  // Achievement operations
  getAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthStats: Map<number, HealthStats>;
  private reminders: Map<number, Reminder>;
  private chatMessages: Map<number, ChatMessage>;
  private appointments: Map<number, Appointment>;
  private homeRemedies: Map<number, HomeRemedy>;
  private healthTracking: Map<number, HealthTracking>;
  private medicineScans: Map<number, MedicineScan>;
  private rewards: Map<number, Reward>;
  private achievements: Map<number, Achievement>;
  
  currentId: number;

  constructor() {
    this.users = new Map();
    this.healthStats = new Map();
    this.reminders = new Map();
    this.chatMessages = new Map();
    this.appointments = new Map();
    this.homeRemedies = new Map();
    this.healthTracking = new Map();
    this.medicineScans = new Map();
    this.rewards = new Map();
    this.achievements = new Map();
    
    this.currentId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create a sample user
    const sampleUser: InsertUser = {
      username: "sarahj",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      tokenBalance: 2840,
      lifetimeTokens: 4250,
      streak: 5,
      streakGoal: 7
    };
    
    const user = this.createUser(sampleUser);
    
    // Create health stats for the user
    const healthStat: InsertHealthStats = {
      userId: user.id,
      date: new Date(),
      bloodPressure: "120/80",
      bloodPressureStatus: "Normal",
      heartRate: 72,
      heartRateStatus: "Normal",
      steps: 6584,
      stepsGoal: 10000,
      hydrationGlasses: 3,
      hydrationGoal: 8
    };
    
    this.createHealthStats(healthStat);
    
    // Create some reminders
    const reminderTypes = ["medicine", "water", "activity"];
    const reminderTitles = ["Take Medication", "Drink Water", "Short Walk"];
    const reminderDescs = ["Aspirin, 1 tablet", "1 glass", "15 minutes"];
    const reminderTimes = [
      new Date(new Date().setHours(12, 30, 0, 0)),
      new Date(new Date().setHours(14, 0, 0, 0)),
      new Date(new Date().setHours(16, 30, 0, 0))
    ];
    
    for (let i = 0; i < 3; i++) {
      this.createReminder({
        userId: user.id,
        title: reminderTitles[i],
        description: reminderDescs[i],
        time: reminderTimes[i],
        type: reminderTypes[i],
        icon: `ri-${reminderTypes[i] === 'medicine' ? 'medicine-bottle' : reminderTypes[i] === 'water' ? 'drop' : 'walk'}-line`,
        completed: false,
        recurring: i % 2 === 0,
        recurringPattern: i % 2 === 0 ? "daily" : undefined
      });
    }
    
    // Create upcoming appointments
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    this.createAppointment({
      userId: user.id,
      type: "Cardiology Follow-up",
      doctorName: "Dr. Michael Chen",
      location: "Valley Medical Center",
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      duration: 45,
      status: "scheduled"
    });
    
    this.createAppointment({
      userId: user.id,
      type: "Annual Physical",
      doctorName: "Dr. Sarah Williams",
      location: "Community Health Center",
      date: new Date(new Date().setDate(new Date().getDate() + 14)),
      duration: 60,
      status: "scheduled"
    });
    
    // Create chat messages
    const conversationId = "conv123456";
    
    this.createChatMessage({
      userId: user.id,
      content: "Hello Sarah! How are you feeling today? I see your blood pressure is normal, but your hydration could use some improvement.",
      sender: "ai",
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 10)),
      conversationId
    });
    
    this.createChatMessage({
      userId: user.id,
      content: "I've been feeling a bit tired today. Maybe that's why I forgot to drink water.",
      sender: "user",
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 8)),
      conversationId
    });
    
    this.createChatMessage({
      userId: user.id,
      content: "Fatigue can definitely be related to dehydration. I'll set a water reminder for you every hour. Also, have you been getting enough sleep lately?",
      sender: "ai",
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 6)),
      conversationId
    });
    
    this.createChatMessage({
      userId: user.id,
      content: "Not really. I've been averaging about 6 hours.",
      sender: "user",
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 4)),
      conversationId
    });
    
    this.createChatMessage({
      userId: user.id,
      content: "Aim for 7-8 hours of sleep for optimal health. Here's a tip: try a 10-minute meditation before bed and avoid screens an hour before sleep. Would you like me to suggest a sleep schedule based on your daily routine?",
      sender: "ai",
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 2)),
      conversationId
    });
    
    // Create home remedies
    const ailments = ["Headache", "Common Cold", "Indigestion", "Sore Throat"];
    const descriptions = [
      "Natural ways to relieve headache pain without medication",
      "Remedies to help you recover from a cold faster",
      "Simple remedies to ease stomach discomfort and indigestion",
      "Soothing remedies for throat pain and irritation"
    ];
    
    for (let i = 0; i < ailments.length; i++) {
      this.createHomeRemedy({
        title: `${ailments[i]} Relief`,
        description: descriptions[i],
        ailment: ailments[i],
        ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
        instructions: `Step 1: Do this\nStep 2: Do that\nStep 3: Rest and repeat if needed`,
        rating: 4 + (i % 2),
        reviewCount: 10 + i * 5
      });
    }
    
    // Create health tracking data
    const types = ["bloodPressure", "heartRate", "steps", "hydration"];
    const now = new Date();
    
    for (let day = 6; day >= 0; day--) {
      const date = new Date();
      date.setDate(now.getDate() - day);
      
      // Blood pressure
      this.createHealthTrackingEntry({
        userId: user.id,
        timestamp: new Date(date),
        type: "bloodPressure",
        value: `${Math.floor(115 + Math.random() * 10)}/${Math.floor(75 + Math.random() * 10)}`,
        notes: "Regular measurement"
      });
      
      // Heart rate
      this.createHealthTrackingEntry({
        userId: user.id,
        timestamp: new Date(date),
        type: "heartRate",
        value: (65 + Math.floor(Math.random() * 15)).toString(),
        notes: "Resting heart rate"
      });
      
      // Steps
      this.createHealthTrackingEntry({
        userId: user.id,
        timestamp: new Date(date),
        type: "steps",
        value: (5000 + Math.floor(Math.random() * 5000)).toString(),
        notes: "Daily activity"
      });
      
      // Hydration
      this.createHealthTrackingEntry({
        userId: user.id,
        timestamp: new Date(date),
        type: "hydration",
        value: (2 + Math.floor(Math.random() * 6)).toString(),
        notes: "Water intake"
      });
    }
    
    // Create medicine scans
    this.createMedicineScan({
      userId: user.id,
      medicineName: "Aspirin",
      dosage: "81mg",
      timing: "Once daily",
      sideEffects: ["Upset stomach", "Heartburn"],
      scannedAt: new Date(new Date().setDate(new Date().getDate() - 3))
    });
    
    this.createMedicineScan({
      userId: user.id,
      medicineName: "Lisinopril",
      dosage: "10mg",
      timing: "Once daily in the morning",
      sideEffects: ["Dizziness", "Cough"],
      scannedAt: new Date(new Date().setDate(new Date().getDate() - 1))
    });
    
    // Create rewards and achievements
    this.createReward({
      userId: user.id,
      type: "token",
      name: "Daily Hydration",
      description: "Completed hydration goal for the day",
      icon: "ri-drop-fill",
      acquiredAt: new Date(new Date().setDate(new Date().getDate() - 2))
    });
    
    this.createReward({
      userId: user.id,
      type: "token",
      name: "Medicine Adherence",
      description: "Took all medications on time",
      icon: "ri-medicine-bottle-fill",
      acquiredAt: new Date(new Date().setDate(new Date().getDate() - 1))
    });
    
    this.createAchievement({
      userId: user.id,
      name: "Step Master",
      description: "Completed 10,000 steps for 3 consecutive days",
      icon: "ri-walk-fill",
      acquiredAt: new Date(new Date().setDate(new Date().getDate() - 5))
    });
    
    this.createAchievement({
      userId: user.id,
      name: "Hydration Hero",
      description: "Drank 8 glasses of water for a week",
      icon: "ri-drop-fill",
      acquiredAt: new Date(new Date().setDate(new Date().getDate() - 3))
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Health stats operations
  async getHealthStats(userId: number): Promise<HealthStats | undefined> {
    return Array.from(this.healthStats.values()).find(
      (stats) => stats.userId === userId,
    );
  }

  async createHealthStats(stats: InsertHealthStats): Promise<HealthStats> {
    const id = this.currentId++;
    const healthStat: HealthStats = { ...stats, id };
    this.healthStats.set(id, healthStat);
    return healthStat;
  }

  async updateHealthStats(id: number, stats: Partial<HealthStats>): Promise<HealthStats | undefined> {
    const healthStat = this.healthStats.get(id);
    if (!healthStat) return undefined;
    
    const updatedStat = { ...healthStat, ...stats };
    this.healthStats.set(id, updatedStat);
    return updatedStat;
  }

  // Reminder operations
  async getReminders(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId,
    );
  }

  async getReminderById(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.currentId++;
    const newReminder: Reminder = { ...reminder, id };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async updateReminder(id: number, reminderData: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...reminderData };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async completeReminder(id: number): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, completed: true };
    this.reminders.set(id, updatedReminder);
    
    // If it's a recurring reminder, create a new one for the next occurrence
    if (reminder.recurring && reminder.recurringPattern) {
      const newDate = new Date(reminder.time);
      
      switch (reminder.recurringPattern) {
        case 'daily':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'weekdays':
          // Skip weekends
          do {
            newDate.setDate(newDate.getDate() + 1);
          } while (newDate.getDay() === 0 || newDate.getDay() === 6);
          break;
        case 'weekly':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'monthly':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
      }
      
      this.createReminder({
        ...reminder,
        time: newDate,
        completed: false
      });
    }
    
    return updatedReminder;
  }

  async snoozeReminder(id: number, minutes: number): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const newTime = new Date(reminder.time);
    newTime.setMinutes(newTime.getMinutes() + minutes);
    
    const updatedReminder = { ...reminder, time: newTime };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  // Chat operations
  async getChatMessages(userId: number, conversationId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId && msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getRecentChatMessages(userId: number): Promise<ChatMessage[]> {
    // Get the latest conversation
    const conversations = new Set(
      Array.from(this.chatMessages.values())
        .filter(msg => msg.userId === userId)
        .map(msg => msg.conversationId)
    );
    
    if (conversations.size === 0) return [];
    
    // Get latest conversation ID
    const latestConversation = Array.from(conversations)[conversations.size - 1];
    
    return this.getChatMessages(userId, latestConversation);
  }

  async getChatConversations(userId: number): Promise<{ id: string, title: string }[]> {
    const conversations = new Map<string, {
      id: string;
      messages: ChatMessage[];
    }>();
    
    Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .forEach(msg => {
        if (!conversations.has(msg.conversationId)) {
          conversations.set(msg.conversationId, {
            id: msg.conversationId,
            messages: []
          });
        }
        conversations.get(msg.conversationId)!.messages.push(msg);
      });
    
    return Array.from(conversations.values()).map(conv => {
      // Get first user message as the title
      const firstUserMsg = conv.messages
        .filter(msg => msg.sender === 'user')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
      
      let title = firstUserMsg ? firstUserMsg.content : 'New Conversation';
      if (title.length > 30) {
        title = title.substring(0, 27) + '...';
      }
      
      return {
        id: conv.id,
        title
      };
    }).sort((a, b) => a.id.localeCompare(b.id));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const chatMessage: ChatMessage = { ...message, id };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  // Appointment operations
  async getAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Home remedy operations
  async getHomeRemedies(): Promise<HomeRemedy[]> {
    return Array.from(this.homeRemedies.values());
  }

  async getHomeRemedyById(id: number): Promise<HomeRemedy | undefined> {
    return this.homeRemedies.get(id);
  }

  async searchHomeRemedies(query: string): Promise<HomeRemedy[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.homeRemedies.values()).filter(
      remedy => 
        remedy.title.toLowerCase().includes(lowerQuery) || 
        remedy.description.toLowerCase().includes(lowerQuery) ||
        remedy.ailment.toLowerCase().includes(lowerQuery)
    );
  }

  async createHomeRemedy(remedy: InsertHomeRemedy): Promise<HomeRemedy> {
    const id = this.currentId++;
    const newRemedy: HomeRemedy = { ...remedy, id };
    this.homeRemedies.set(id, newRemedy);
    return newRemedy;
  }

  // Health tracking operations
  async getHealthTrackingData(userId: number, type: string, timeRange: string): Promise<HealthTracking[]> {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    return Array.from(this.healthTracking.values())
      .filter(entry => 
        entry.userId === userId &&
        (type === 'all' || entry.type === type) &&
        new Date(entry.timestamp) >= startDate
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createHealthTrackingEntry(entry: InsertHealthTracking): Promise<HealthTracking> {
    const id = this.currentId++;
    const newEntry: HealthTracking = { ...entry, id };
    this.healthTracking.set(id, newEntry);
    
    // Update the user's health stats
    const healthStat = Array.from(this.healthStats.values()).find(
      stat => stat.userId === entry.userId
    );
    
    if (healthStat) {
      let updatedStat = { ...healthStat };
      
      switch (entry.type) {
        case 'bloodPressure':
          updatedStat.bloodPressure = entry.value;
          break;
        case 'heartRate':
          updatedStat.heartRate = parseInt(entry.value);
          break;
        case 'steps':
          updatedStat.steps = parseInt(entry.value);
          break;
        case 'hydration':
          updatedStat.hydrationGlasses = parseInt(entry.value);
          break;
      }
      
      this.healthStats.set(healthStat.id, updatedStat);
    }
    
    return newEntry;
  }

  // Medicine scan operations
  async getMedicineScans(userId: number): Promise<MedicineScan[]> {
    return Array.from(this.medicineScans.values())
      .filter(scan => scan.userId === userId)
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  }

  async createMedicineScan(scan: InsertMedicineScan): Promise<MedicineScan> {
    const id = this.currentId++;
    const newScan: MedicineScan = { ...scan, id };
    this.medicineScans.set(id, newScan);
    return newScan;
  }

  // Rewards operations
  async getRewards(userId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.userId === userId)
      .sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime());
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const id = this.currentId++;
    const newReward: Reward = { ...reward, id };
    this.rewards.set(id, newReward);
    
    // If reward type is token, update user's token balance
    if (reward.type === 'token') {
      const user = this.users.get(reward.userId);
      if (user) {
        const tokenAmount = 10; // Default token amount
        const updatedUser = { 
          ...user, 
          tokenBalance: (user.tokenBalance || 0) + tokenAmount,
          lifetimeTokens: (user.lifetimeTokens || 0) + tokenAmount
        };
        this.users.set(user.id, updatedUser);
      }
    }
    
    return newReward;
  }

  // Achievement operations
  async getAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime());
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentId++;
    const newAchievement: Achievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    
    // When an achievement is earned, also create a token reward
    this.createReward({
      userId: achievement.userId,
      type: 'token',
      name: `Achievement: ${achievement.name}`,
      description: `Earned ${achievement.name} achievement`,
      icon: achievement.icon,
      acquiredAt: achievement.acquiredAt
    });
    
    return newAchievement;
  }
}

export const storage = new MemStorage();
