/**
 * @file projectPhaseModel.js
 * @description Model per le fasi del progetto NewCampus
 * @version 1.0
 */

const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  title: String,
  description: String,
  order: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const projectPhaseSchema = new mongoose.Schema(
  {
    phaseNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 4,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Completato', 'In corso', 'In pianificazione', 'In attesa'],
      default: 'In attesa',
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    timeline: {
      type: String,
      required: true,
    },
    details: [
      {
        type: String,
      },
    ],
    // Contenuto aggiuntivo da database
    fullDescription: {
      type: String,
      description: 'Descrizione estesa della fase',
    },
    objectives: [
      {
        title: String,
        description: String,
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Media per la fase
    media: [mediaSchema],
    // Gallery principale
    gallery: {
      coverImage: String,
      images: [
        {
          url: String,
          title: String,
          description: String,
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    // Video principale
    mainVideo: {
      youtubeId: String,
      vimeoId: String,
      title: String,
      description: String,
    },
    // Budget e risorse
    budget: {
      allocated: Number,
      spent: Number,
      currency: {
        type: String,
        default: 'EUR',
      },
    },
    // Team e responsabili
    team: [
      {
        name: String,
        role: String,
        email: String,
        phone: String,
      },
    ],
    // Milestones
    milestones: [
      {
        name: String,
        dueDate: Date,
        completed: {
          type: Boolean,
          default: false,
        },
        completedDate: Date,
      },
    ],
    // Challenges e soluzioni
    challenges: [
      {
        title: String,
        description: String,
        solution: String,
        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Statistiche
    views: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    // Ordine di visualizzazione
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index per queries frequenti
// phaseNumber index è creato automaticamente da 'unique: true'
projectPhaseSchema.index({ status: 1 });
projectPhaseSchema.index({ isPublished: 1 });
projectPhaseSchema.index({ createdAt: -1 });

// Metodo per incrementare views
projectPhaseSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Metodo per ottenere il progresso totale
projectPhaseSchema.statics.getTotalProgress = async function () {
  const phases = await this.find({ isPublished: true });
  if (phases.length === 0) return 0;
  const total = phases.reduce((sum, p) => sum + p.percentage, 0);
  return Math.round(total / phases.length);
};

// Metodo per ottenere statistiche fase
projectPhaseSchema.methods.getStats = function () {
  return {
    phaseNumber: this.phaseNumber,
    title: this.title,
    percentage: this.percentage,
    mediaCount: this.media.length + (this.gallery?.images?.length || 0),
    milestonesTotal: this.milestones.length,
    milestonesCompleted: this.milestones.filter((m) => m.completed).length,
    budgetUtilization: this.budget.allocated
      ? Math.round((this.budget.spent / this.budget.allocated) * 100)
      : 0,
  };
};

module.exports = mongoose.model('ProjectPhase', projectPhaseSchema);
