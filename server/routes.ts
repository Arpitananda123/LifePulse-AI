import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertReminderSchema, 
  insertAppointmentSchema, 
  insertChatMessageSchema,
  insertHealthTrackingSchema,
  insertMedicineScanSchema 
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Config route for client usage
  app.get("/api/config", (req, res) => {
    // We now use Hugging Face's free tier which doesn't require an API key
    res.json({
      aiProvider: "huggingface",
      aiStatus: "active"
    });
  });
  
  // --- User Routes ---
  app.get("/api/users/current", async (req, res) => {
    try {
      // In a real app, this would use authentication
      // For now, just return the first user
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Health Stats Routes ---
  app.get("/api/health-stats/latest", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const healthStats = await storage.getHealthStats(userId);
      if (!healthStats) {
        return res.status(404).json({ message: "Health stats not found" });
      }
      
      return res.json(healthStats);
    } catch (error) {
      console.error("Error fetching health stats:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Reminder Routes ---
  app.get("/api/reminders", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const reminders = await storage.getReminders(userId);
      return res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/reminders", async (req, res) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);
      
      // Convert time field to Date if it's a string
      if (typeof reminderData.time === "string") {
        reminderData.time = new Date(reminderData.time);
      }
      
      const newReminder = await storage.createReminder(reminderData);
      return res.status(201).json(newReminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/reminders/:id/complete", async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      
      const reminder = await storage.getReminderById(reminderId);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const updatedReminder = await storage.completeReminder(reminderId);
      return res.json(updatedReminder);
    } catch (error) {
      console.error("Error completing reminder:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/reminders/:id/snooze", async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      const { minutes } = req.body;
      
      if (!minutes || typeof minutes !== 'number') {
        return res.status(400).json({ message: "Minutes required" });
      }
      
      const reminder = await storage.getReminderById(reminderId);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const updatedReminder = await storage.snoozeReminder(reminderId, minutes);
      return res.json(updatedReminder);
    } catch (error) {
      console.error("Error snoozing reminder:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Chat Routes ---
  app.get("/api/chat/messages/recent", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const messages = await storage.getRecentChatMessages(userId);
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/chat/messages", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const conversationId = req.query.conversationId as string;
      if (!conversationId) {
        return res.status(400).json({ message: "Conversation ID required" });
      }
      
      const messages = await storage.getChatMessages(userId, conversationId);
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/chat/conversations", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const conversations = await storage.getChatConversations(userId);
      return res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId: 1 // In a real app, this would be the current user's ID
      });
      
      // Convert timestamp field to Date if it's a string
      if (typeof messageData.timestamp === "string") {
        messageData.timestamp = new Date(messageData.timestamp);
      }
      
      const newMessage = await storage.createChatMessage(messageData);
      return res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Appointment Routes ---
  app.get("/api/appointments", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const appointments = await storage.getAppointments(userId);
      return res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      return res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId: 1 // In a real app, this would be the current user's ID
      });
      
      // Convert date field to Date if it's a string
      if (typeof appointmentData.date === "string") {
        appointmentData.date = new Date(appointmentData.date);
      }
      
      const newAppointment = await storage.createAppointment(appointmentData);
      return res.status(201).json(newAppointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Home Remedy Routes ---
  app.get("/api/home-remedies", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      let remedies;
      if (query) {
        remedies = await storage.searchHomeRemedies(query);
      } else {
        remedies = await storage.getHomeRemedies();
      }
      
      return res.json(remedies);
    } catch (error) {
      console.error("Error fetching home remedies:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/home-remedies/:id", async (req, res) => {
    try {
      const remedyId = parseInt(req.params.id);
      
      const remedy = await storage.getHomeRemedyById(remedyId);
      if (!remedy) {
        return res.status(404).json({ message: "Home remedy not found" });
      }
      
      return res.json(remedy);
    } catch (error) {
      console.error("Error fetching home remedy:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Health Tracking Routes ---
  app.get("/api/health-tracking", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const type = req.query.metric as string || 'all';
      const timeRange = req.query.timeRange as string || 'week';
      
      const trackingData = await storage.getHealthTrackingData(userId, type, timeRange);
      return res.json(trackingData);
    } catch (error) {
      console.error("Error fetching health tracking data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/health-tracking", async (req, res) => {
    try {
      const trackingData = insertHealthTrackingSchema.parse({
        ...req.body,
        userId: 1, // In a real app, this would be the current user's ID
        timestamp: new Date()
      });
      
      const newEntry = await storage.createHealthTrackingEntry(trackingData);
      return res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating health tracking entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid health tracking data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Medicine Scanner Routes ---
  app.get("/api/medicine-scans", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const scans = await storage.getMedicineScans(userId);
      return res.json(scans);
    } catch (error) {
      console.error("Error fetching medicine scans:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/medicine-scans", async (req, res) => {
    try {
      const scanData = insertMedicineScanSchema.parse({
        ...req.body,
        userId: 1, // In a real app, this would be the current user's ID
        scannedAt: new Date()
      });
      
      const newScan = await storage.createMedicineScan(scanData);
      return res.status(201).json(newScan);
    } catch (error) {
      console.error("Error creating medicine scan:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid medicine scan data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Rewards Routes ---
  app.get("/api/rewards", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const rewards = await storage.getRewards(userId);
      return res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // --- Achievements Routes ---
  app.get("/api/achievements", async (req, res) => {
    try {
      // In a real app, this would get the current user's ID from the session
      const userId = 1;
      
      const achievements = await storage.getAchievements(userId);
      return res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
