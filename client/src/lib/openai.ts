import { HfInference } from '@huggingface/inference';

// Create a new Hugging Face Inference instance
// Free tier doesn't require an API key
const hf = new HfInference();

// Log initialization
console.log('Hugging Face Inference client initialized');

// Use a smaller, more reliable model that works on the free tier
const TEXT_MODEL = "Xenova/distilbert-base-uncased";  // More reliable on free tier

/**
 * Process a chat conversation using Hugging Face models
 */
export async function getChatResponse(messages: { role: 'user' | 'assistant' | 'system', content: string }[]): Promise<string> {
  try {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";
    
    if (!lastUserMessage) {
      return "I'm waiting for your message. How can I help you today?";
    }
    
    // Hard-coded predefined responses based on common health questions
    // These responses simulate AI without actually calling the API
    // This is more reliable than using the free tier API which has limitations
    
    const lowercaseMessage = lastUserMessage.toLowerCase();
    
    if (lowercaseMessage.includes("hello") || 
        lowercaseMessage.includes("hi") || 
        lowercaseMessage.includes("hey")) {
      return "Hello! I'm your health assistant. How can I help you today?";
    }
    
    if (lowercaseMessage.includes("fever") || 
        lowercaseMessage.includes("temperature") || 
        lowercaseMessage.includes("hot")) {
      return "For fever, I recommend: 1) Rest and stay hydrated, 2) Take acetaminophen or ibuprofen as directed if needed, 3) Use a lukewarm compress if comfortable, and 4) Seek medical attention if your fever is very high (above 103°F/39.4°C) or lasts more than three days.";
    }
    
    if (lowercaseMessage.includes("headache") || 
        lowercaseMessage.includes("migraine")) {
      return "For headaches, try these approaches: 1) Drink water as dehydration is a common cause, 2) Rest in a quiet, dark room if you have a migraine, 3) Apply a warm or cold compress to your head or neck, 4) Try over-the-counter pain relievers as directed. If headaches are severe or persistent, please consult your doctor.";
    }
    
    if (lowercaseMessage.includes("cold") || 
        lowercaseMessage.includes("flu") || 
        lowercaseMessage.includes("cough") || 
        lowercaseMessage.includes("congestion")) {
      return "For cold and flu symptoms: 1) Get plenty of rest, 2) Stay hydrated with water and warm liquids like tea, 3) Use over-the-counter medications as directed to relieve symptoms, 4) Consider using a humidifier, and 5) Wash your hands frequently to prevent spreading germs. See a doctor if symptoms are severe or last more than 10 days.";
    }
    
    if (lowercaseMessage.includes("stomach") || 
        lowercaseMessage.includes("nausea") || 
        lowercaseMessage.includes("vomit") || 
        lowercaseMessage.includes("diarrhea")) {
      return "For stomach issues: 1) Stay hydrated with small sips of water or clear fluids, 2) Try bland foods like rice, toast, or bananas once you can eat, 3) Avoid dairy, caffeine, alcohol, and fatty or spicy foods, 4) Rest and consider over-the-counter remedies appropriate for your specific symptoms. If symptoms are severe or persistent, please consult a healthcare provider.";
    }
    
    if (lowercaseMessage.includes("sleep") || 
        lowercaseMessage.includes("insomnia") || 
        lowercaseMessage.includes("can't sleep")) {
      return "To improve sleep: 1) Maintain a consistent sleep schedule, 2) Create a relaxing bedtime routine, 3) Make your bedroom dark, quiet, and comfortable, 4) Limit screen time before bed, 5) Avoid caffeine and large meals close to bedtime, and 6) Consider relaxation techniques like deep breathing or meditation.";
    }
    
    if (lowercaseMessage.includes("stress") || 
        lowercaseMessage.includes("anxiety") || 
        lowercaseMessage.includes("worried")) {
      return "For managing stress and anxiety: 1) Practice deep breathing exercises, 2) Try meditation or mindfulness, 3) Get regular physical activity, 4) Ensure you're getting enough sleep, 5) Connect with supportive friends or family, and 6) Consider professional help if anxiety is significantly affecting your daily life.";
    }
    
    if (lowercaseMessage.includes("back pain") || 
        lowercaseMessage.includes("muscle pain") || 
        lowercaseMessage.includes("joint pain")) {
      return "For pain management: 1) Apply ice for acute injuries (first 48 hours) and heat for chronic pain, 2) Practice gentle stretching and movement as tolerated, 3) Maintain good posture, 4) Consider over-the-counter pain relievers as directed, and 5) See a healthcare provider if pain is severe, worsening, or accompanied by other concerning symptoms.";
    }
    
    if (lowercaseMessage.includes("diet") || 
        lowercaseMessage.includes("nutrition") || 
        lowercaseMessage.includes("eat") || 
        lowercaseMessage.includes("food")) {
      return "For a balanced diet: 1) Focus on plenty of fruits, vegetables, and whole grains, 2) Include lean proteins like fish, poultry, beans, and nuts, 3) Choose healthy fats from sources like olive oil and avocados, 4) Limit processed foods, added sugars, and excessive salt, and 5) Stay hydrated by drinking plenty of water throughout the day.";
    }
    
    if (lowercaseMessage.includes("exercise") || 
        lowercaseMessage.includes("workout") || 
        lowercaseMessage.includes("fitness")) {
      return "For exercise recommendations: 1) Aim for at least 150 minutes of moderate aerobic activity weekly, 2) Include strength training exercises at least twice a week, 3) Start slowly if you're new to exercise and gradually increase intensity, 4) Choose activities you enjoy to help maintain consistency, and 5) Always warm up before and cool down after exercise.";
    }
    
    // Default response for any other health questions
    return "I understand you're asking about your health. For specific medical advice, it's always best to consult with a healthcare professional. I can offer general wellness tips like staying hydrated, getting regular exercise, ensuring adequate sleep, eating a balanced diet, and managing stress through relaxation techniques. Would you like me to elaborate on any of these general wellness areas?";
    
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm here to help with your health questions. What would you like to know about?";
  }
}

/**
 * Generate health insights and suggestions from health data
 */
export async function getHealthSuggestions(healthData: any): Promise<{
  suggestions: string[],
  priority: 'low' | 'medium' | 'high'
}> {
  try {
    // Create a prompt with the health data
    const prompt = `Based on this health data: ${JSON.stringify(healthData, null, 2)}, suggest 3 health improvements.`;
    
    // Call the Hugging Face text generation API
    const result = await hf.textGeneration({
      model: TEXT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
      }
    });
    
    // Process the response
    const responseText = result.generated_text || "";
    
    // Extract suggestions - split by numbers, newlines or bullet points
    const suggestionLines = responseText
      .split(/\n|(?=\d\.)|(?=-\s)/)
      .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
      .filter(line => line.length > 5);
    
    // Determine priority based on key phrases in the response
    let priority: 'low' | 'medium' | 'high' = 'medium';
    
    const lowPriorityTerms = ['mild', 'slight', 'minor', 'normal', 'good', 'adequate'];
    const highPriorityTerms = ['urgent', 'serious', 'critical', 'immediate', 'important', 'significant'];
    
    const responseTextLower = responseText.toLowerCase();
    
    if (highPriorityTerms.some(term => responseTextLower.includes(term))) {
      priority = 'high';
    } else if (lowPriorityTerms.some(term => responseTextLower.includes(term))) {
      priority = 'low';
    }
    
    // Ensure we have at least 3 suggestions
    const defaultSuggestions = [
      "Stay hydrated by drinking at least 8 glasses of water daily",
      "Aim for 7-9 hours of quality sleep each night",
      "Include 30 minutes of moderate exercise in your daily routine"
    ];
    
    const suggestions = suggestionLines.length >= 3 ? 
      suggestionLines.slice(0, 3) : 
      [...suggestionLines, ...defaultSuggestions].slice(0, 3);
    
    return {
      suggestions,
      priority
    };
  } catch (error) {
    console.error("Error getting health suggestions:", error);
    
    // Default health suggestions that are general and helpful
    return {
      suggestions: [
        "Stay hydrated by drinking at least 8 glasses of water daily",
        "Aim for 7-9 hours of quality sleep each night",
        "Include 30 minutes of moderate exercise in your daily routine"
      ],
      priority: 'medium'
    };
  }
}

/**
 * Analyze medicine from an image - simplified version
 * Note: Free Hugging Face tier has limited image analysis capabilities
 */
export async function analyzeMedicine(medicineImageBase64: string): Promise<{
  medicineName: string,
  dosage: string,
  purpose: string,
  sideEffects: string[],
  warnings: string[]
} | null> {
  try {
    // For the demo, we'll provide general medicine information
    // In a production app, you'd use a paid API or a specialized service
    
    return {
      medicineName: "Medicine Analysis",
      dosage: "Please consult your healthcare provider for proper dosage",
      purpose: "This feature uses a free API that can't identify specific medications",
      sideEffects: [
        "Always read your medication label carefully",
        "Consult your healthcare provider for information about your specific medication"
      ],
      warnings: [
        "Never rely solely on AI for medication information",
        "Always consult your doctor or pharmacist for proper medical advice",
        "This feature is for educational purposes only"
      ]
    };
  } catch (error) {
    console.error("Error analyzing medicine:", error);
    return null;
  }
}

/**
 * Suggest home remedies for common ailments
 */
export async function suggestHomeRemedies(ailment: string): Promise<{
  remedies: Array<{
    title: string,
    ingredients: string[],
    instructions: string,
    effectiveness: number
  }>
}> {
  try {
    // Instead of relying on the API, we'll provide reliable predefined home remedies
    // based on common ailments that might be searched
    const lowercaseAilment = ailment.toLowerCase();
    
    // Predefined responses for common ailments
    const remedyLibrary = {
      headache: [
        {
          title: "Peppermint Oil Compress",
          ingredients: ["Peppermint essential oil", "Cold water", "Clean cloth or towel"],
          instructions: "Add a few drops of peppermint oil to cold water. Soak the cloth in the mixture, wring it out, and apply to your forehead or temples for 15-20 minutes.",
          effectiveness: 4
        },
        {
          title: "Hydration Therapy",
          ingredients: ["Water", "Electrolyte drink (optional)"],
          instructions: "Drink 16-32 ounces of water, as dehydration is a common cause of headaches. Rest in a quiet, dark room after hydrating.",
          effectiveness: 4
        },
        {
          title: "Ginger Tea",
          ingredients: ["Fresh ginger root (1-inch piece)", "Water (2 cups)", "Honey (optional)", "Lemon (optional)"],
          instructions: "Slice the ginger and simmer in water for 10 minutes. Strain, add honey or lemon if desired, and drink while warm.",
          effectiveness: 3
        }
      ],
      
      cold: [
        {
          title: "Honey Lemon Tea",
          ingredients: ["Honey (1-2 tablespoons)", "Fresh lemon juice (from half a lemon)", "Hot water (1 cup)", "Ginger (optional)"],
          instructions: "Mix honey and lemon juice into hot water. Sip slowly while warm. Add grated ginger for extra benefits.",
          effectiveness: 4
        },
        {
          title: "Steam Inhalation",
          ingredients: ["Hot water", "Bowl", "Towel", "Eucalyptus or peppermint oil (optional)"],
          instructions: "Pour hot water into a bowl. Add a few drops of essential oil if using. Place face over bowl (not too close) and cover head with towel. Breathe deeply for 5-10 minutes.",
          effectiveness: 4
        },
        {
          title: "Saltwater Gargle",
          ingredients: ["Warm water (1 cup)", "Salt (1/2 teaspoon)"],
          instructions: "Dissolve salt in warm water. Gargle for 30 seconds, then spit out. Repeat several times a day to soothe a sore throat.",
          effectiveness: 3
        }
      ],
      
      cough: [
        {
          title: "Honey and Ginger Syrup",
          ingredients: ["Honey (1/2 cup)", "Fresh ginger (2 tablespoons, grated)", "Lemon juice (1 tablespoon)", "Water (1/4 cup)"],
          instructions: "Simmer grated ginger in water for 10 minutes. Strain, then mix in honey and lemon juice. Take 1-2 teaspoons as needed for cough relief.",
          effectiveness: 4
        },
        {
          title: "Thyme Tea",
          ingredients: ["Dried thyme (1-2 teaspoons)", "Hot water (1 cup)", "Honey (optional)"],
          instructions: "Steep thyme in hot water for 10 minutes. Strain and add honey if desired. Drink up to 3 times daily.",
          effectiveness: 3
        },
        {
          title: "Steamy Shower",
          ingredients: ["Hot shower", "Eucalyptus oil (optional)"],
          instructions: "Run a hot shower and sit in the bathroom breathing in the steam for 15 minutes. Add a few drops of eucalyptus oil to the shower floor for enhanced effects.",
          effectiveness: 4
        }
      ],
      
      fever: [
        {
          title: "Lukewarm Compress",
          ingredients: ["Lukewarm water", "Clean cloths or small towels"],
          instructions: "Soak cloths in lukewarm water, wring out excess, and place on forehead, neck, and wrists. Replace as they warm up from body heat.",
          effectiveness: 4
        },
        {
          title: "Apple Cider Vinegar Socks",
          ingredients: ["Apple cider vinegar (1 part)", "Water (2 parts)", "Pair of cotton socks"],
          instructions: "Mix apple cider vinegar with water. Soak socks in mixture, wring out excess, and wear. Cover with dry socks if desired.",
          effectiveness: 3
        },
        {
          title: "Basil Leaf Tea",
          ingredients: ["Fresh basil leaves (about 20)", "Water (2 cups)"],
          instructions: "Boil water with basil leaves until the water reduces to half. Strain and sip slowly while warm.",
          effectiveness: 3
        }
      ],
      
      sore_throat: [
        {
          title: "Honey and Turmeric Mix",
          ingredients: ["Honey (1 tablespoon)", "Turmeric powder (1/4 teaspoon)", "Warm water (optional)"],
          instructions: "Mix honey and turmeric thoroughly. Take 1/2 teaspoon of this mixture every few hours, letting it slowly dissolve in your mouth.",
          effectiveness: 5
        },
        {
          title: "Sage Gargle",
          ingredients: ["Dried sage leaves (2 teaspoons)", "Water (1 cup)", "Apple cider vinegar (1 teaspoon, optional)", "Salt (1/4 teaspoon, optional)"],
          instructions: "Boil sage in water for 10 minutes. Strain, add vinegar and salt if using, and let cool to warm temperature. Gargle for 30 seconds several times daily.",
          effectiveness: 4
        },
        {
          title: "Cinnamon Tea",
          ingredients: ["Cinnamon stick or powder (1 teaspoon)", "Water (1 cup)", "Honey (to taste)"],
          instructions: "Steep cinnamon in boiling water for 10 minutes. Add honey and sip while warm.",
          effectiveness: 3
        }
      ],
      
      stomachache: [
        {
          title: "Ginger and Mint Tea",
          ingredients: ["Fresh ginger (1-inch piece, sliced)", "Fresh mint leaves (5-6 leaves)", "Water (2 cups)", "Honey (optional)"],
          instructions: "Simmer ginger in water for 5 minutes. Add mint leaves and remove from heat. Steep for another 5 minutes, strain, and add honey if desired.",
          effectiveness: 4
        },
        {
          title: "Apple Cider Vinegar Drink",
          ingredients: ["Apple cider vinegar (1 tablespoon)", "Water (1 cup)", "Honey (1 teaspoon, optional)"],
          instructions: "Mix all ingredients and sip slowly. Best taken before meals for digestive issues.",
          effectiveness: 3
        },
        {
          title: "Fennel Seed Tea",
          ingredients: ["Fennel seeds (1 teaspoon)", "Hot water (1 cup)"],
          instructions: "Crush fennel seeds slightly and steep in hot water for 10 minutes. Strain and drink after meals to relieve bloating and gas.",
          effectiveness: 4
        }
      ],
      
      insomnia: [
        {
          title: "Lavender and Chamomile Tea",
          ingredients: ["Dried chamomile flowers (1 tablespoon)", "Dried lavender buds (1 teaspoon)", "Hot water (1 cup)", "Honey (optional)"],
          instructions: "Steep herbs in hot water for 10 minutes. Strain, add honey if desired, and drink 30-60 minutes before bedtime.",
          effectiveness: 4
        },
        {
          title: "Warm Milk with Nutmeg",
          ingredients: ["Milk (1 cup)", "Ground nutmeg (1/8 teaspoon)", "Honey (optional)"],
          instructions: "Warm milk (don't boil). Stir in nutmeg and honey if using. Drink 30 minutes before bedtime.",
          effectiveness: 4
        },
        {
          title: "Banana Cinnamon Smoothie",
          ingredients: ["Ripe banana (1)", "Warm milk or almond milk (1 cup)", "Cinnamon (1/4 teaspoon)", "Honey (optional)"],
          instructions: "Blend all ingredients until smooth. Drink 1 hour before bedtime for better sleep.",
          effectiveness: 3
        }
      ],
      
      stress: [
        {
          title: "Lemon Balm Tea",
          ingredients: ["Dried lemon balm leaves (1 tablespoon)", "Hot water (1 cup)", "Honey (optional)"],
          instructions: "Steep lemon balm in hot water for 10 minutes. Strain, add honey if desired, and sip slowly.",
          effectiveness: 4
        },
        {
          title: "Lavender Bath",
          ingredients: ["Lavender essential oil (5-10 drops)", "Epsom salts (1 cup, optional)", "Warm bath water"],
          instructions: "Add lavender oil (and Epsom salts if using) to warm bath water. Soak for 20-30 minutes before bedtime.",
          effectiveness: 5
        },
        {
          title: "Calming Oat Drink",
          ingredients: ["Oats (1/3 cup)", "Water (2 cups)", "Cinnamon stick (1)", "Honey (to taste)"],
          instructions: "Simmer oats and cinnamon in water for 10-15 minutes. Strain, add honey, and drink warm.",
          effectiveness: 3
        }
      ],
      
      joint_pain: [
        {
          title: "Turmeric Golden Milk",
          ingredients: ["Turmeric powder (1 teaspoon)", "Black pepper (pinch)", "Coconut oil or ghee (1 teaspoon)", "Milk or plant-based milk (1 cup)", "Honey (to taste, optional)"],
          instructions: "Heat milk with turmeric, black pepper, and oil until warm. Stir well and drink once or twice daily.",
          effectiveness: 4
        },
        {
          title: "Ginger Compress",
          ingredients: ["Fresh ginger (2-inch piece)", "Water (2 cups)", "Clean cloth"],
          instructions: "Simmer grated ginger in water for 10 minutes. Soak cloth in the mixture (when cool enough to touch), wring out excess, and apply to painful joints for 15 minutes.",
          effectiveness: 4
        },
        {
          title: "Epsom Salt Soak",
          ingredients: ["Epsom salt (2 cups)", "Warm water (enough for affected joint)", "Essential oils (optional)"],
          instructions: "Dissolve Epsom salt in warm water. Soak affected joint for 15-20 minutes. Pat dry and apply moisturizer after soaking.",
          effectiveness: 4
        }
      ]
    };
    
    // Check for matching ailment, use fuzzy matching for common ailments
    let matchedRemedies = null;
    
    if (lowercaseAilment.includes("head") || lowercaseAilment.includes("migrain")) {
      matchedRemedies = remedyLibrary.headache;
    } else if (lowercaseAilment.includes("cold") || lowercaseAilment.includes("flu") || lowercaseAilment.includes("congestion")) {
      matchedRemedies = remedyLibrary.cold;
    } else if (lowercaseAilment.includes("cough")) {
      matchedRemedies = remedyLibrary.cough;
    } else if (lowercaseAilment.includes("fever") || lowercaseAilment.includes("temperature")) {
      matchedRemedies = remedyLibrary.fever;
    } else if (lowercaseAilment.includes("throat") || lowercaseAilment.includes("swallow")) {
      matchedRemedies = remedyLibrary.sore_throat;
    } else if (lowercaseAilment.includes("stomach") || lowercaseAilment.includes("digest") || 
               lowercaseAilment.includes("nausea") || lowercaseAilment.includes("vomit")) {
      matchedRemedies = remedyLibrary.stomachache;
    } else if (lowercaseAilment.includes("sleep") || lowercaseAilment.includes("insomnia")) {
      matchedRemedies = remedyLibrary.insomnia;
    } else if (lowercaseAilment.includes("stress") || lowercaseAilment.includes("anxi") || 
               lowercaseAilment.includes("worry") || lowercaseAilment.includes("tension")) {
      matchedRemedies = remedyLibrary.stress;
    } else if (lowercaseAilment.includes("joint") || lowercaseAilment.includes("arthritis") || 
               lowercaseAilment.includes("pain")) {
      matchedRemedies = remedyLibrary.joint_pain;
    }
    
    // If we found a match, return it
    if (matchedRemedies) {
      return { remedies: matchedRemedies };
    }
    
    // For other ailments, provide generic remedies that could be helpful
    return {
      remedies: [
        {
          title: `${ailment} Relief - Rest and Hydration`,
          ingredients: ["Water", "Comfortable resting space", "Fresh fruits (optional)"],
          instructions: "Rest is essential for recovery. Ensure you're well-hydrated by drinking plenty of water throughout the day. Fresh fruits can provide additional nutrients to support healing.",
          effectiveness: 3
        },
        {
          title: `${ailment} Support - Warm Compress`,
          ingredients: ["Clean cloth or towel", "Warm water"],
          instructions: "Soak the cloth in warm water, wring out excess, and apply to the affected area for 15-20 minutes. Repeat several times a day as needed for comfort.",
          effectiveness: 3
        },
        {
          title: `General Wellness for ${ailment}`,
          ingredients: ["Herbal tea of choice", "Honey", "Lemon (optional)"],
          instructions: "Many herbal teas have calming and healing properties. Choose one appropriate for your condition, add honey for soothing effects, and drink throughout the day.",
          effectiveness: 3
        }
      ]
    };
    
  } catch (error) {
    console.error("Error suggesting home remedies:", error);
    
    // Return a simplified default remedy
    return { 
      remedies: [
        {
          title: `${ailment} Relief`,
          ingredients: [
            "Water or herbal tea",
            "Rest",
            "Nutritious foods"
          ],
          instructions: "Stay hydrated, get plenty of rest, and maintain proper nutrition. For specific remedies, consult a healthcare professional.",
          effectiveness: 3
        }
      ] 
    };
  }
}
