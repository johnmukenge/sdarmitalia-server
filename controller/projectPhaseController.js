/**
 * @file projectPhaseController.js
 * @description Controller per gestire le fasi del progetto NewCampus
 * @version 1.0
 */

const ProjectPhase = require('../models/projectPhaseModel');
const APIFeatures = require('../utils/apiFeatures');

/**
 * Recupera tutte le fasi del progetto
 * @async
 */
exports.getAllPhases = async (req, res) => {
  try {
    const features = new APIFeatures(
      ProjectPhase.find({ isPublished: true }),
      req.query,
    )
      .sort()
      .limitFields();

    const phases = await features.query;
    const totalProgress = await ProjectPhase.getTotalProgress();

    res.status(200).json({
      success: true,
      message: 'Fasi del progetto recuperate con successo',
      data: {
        phases,
        totalProgress,
        phaseCount: phases.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle fasi',
      error: error.message,
    });
  }
};

/**
 * Recupera una singola fase per numero
 * @async
 */
exports.getPhaseByNumber = async (req, res) => {
  try {
    const { phaseNumber } = req.params;
    const phase = await ProjectPhase.findOne({
      phaseNumber: parseInt(phaseNumber),
      isPublished: true,
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    // Incrementa views
    await phase.incrementViews();

    res.status(200).json({
      success: true,
      data: phase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della fase',
      error: error.message,
    });
  }
};

/**
 * Recupera una singola fase per ID
 * @async
 */
exports.getPhaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const phase = await ProjectPhase.findById(id);

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    await phase.incrementViews();

    res.status(200).json({
      success: true,
      data: phase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della fase',
      error: error.message,
    });
  }
};

/**
 * Recupera media di una fase specifica
 * @async
 */
exports.getPhaseMedia = async (req, res) => {
  try {
    const { phaseNumber } = req.params;
    const phase = await ProjectPhase.findOne({
      phaseNumber: parseInt(phaseNumber),
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    const media = {
      mainVideo: phase.mainVideo,
      gallery: phase.gallery,
      media: phase.media.sort((a, b) => a.order - b.order),
    };

    res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei media',
      error: error.message,
    });
  }
};

/**
 * Recupera milestone di una fase
 * @async
 */
exports.getPhaseMilestones = async (req, res) => {
  try {
    const { phaseNumber } = req.params;
    const phase = await ProjectPhase.findOne({
      phaseNumber: parseInt(phaseNumber),
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        milestones: phase.milestones,
        completed: phase.milestones.filter((m) => m.completed).length,
        total: phase.milestones.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei milestone',
      error: error.message,
    });
  }
};

/**
 * Recupera statistiche di tutte le fasi
 * @async
 */
exports.getProjectStats = async (req, res) => {
  try {
    const phases = await ProjectPhase.find({ isPublished: true });
    const totalProgress = await ProjectPhase.getTotalProgress();

    const stats = {
      totalProgress,
      phaseCount: phases.length,
      completedPhases: phases.filter((p) => p.percentage === 100).length,
      inProgressPhases: phases.filter(
        (p) => p.percentage > 0 && p.percentage < 100,
      ).length,
      plannedPhases: phases.filter((p) => p.percentage === 0).length,
      totalMilestones: phases.reduce((sum, p) => sum + p.milestones.length, 0),
      completedMilestones: phases.reduce(
        (sum, p) => sum + p.milestones.filter((m) => m.completed).length,
        0,
      ),
      totalBudgetAllocated: phases.reduce(
        (sum, p) => sum + (p.budget?.allocated || 0),
        0,
      ),
      totalBudgetSpent: phases.reduce(
        (sum, p) => sum + (p.budget?.spent || 0),
        0,
      ),
      totalViews: phases.reduce((sum, p) => sum + p.views, 0),
      phases: phases.map((p) => p.getStats()),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel calcolo delle statistiche',
      error: error.message,
    });
  }
};

/**
 * Crea una nuova fase (admin)
 * @async
 */
exports.createPhase = async (req, res) => {
  try {
    const phase = await ProjectPhase.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Fase creata con successo',
      data: phase,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Errore nella creazione della fase',
      error: error.message,
    });
  }
};

/**
 * Aggiorna una fase (admin)
 * @async
 */
exports.updatePhase = async (req, res) => {
  try {
    const { id } = req.params;
    const phase = await ProjectPhase.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fase aggiornata con successo',
      data: phase,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Errore nell'aggiornamento della fase",
      error: error.message,
    });
  }
};

/**
 * Aggiorna il progresso di una fase
 * @async
 */
exports.updatePhaseProgress = async (req, res) => {
  try {
    const { phaseNumber } = req.params;
    const { percentage } = req.body;

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentuale non valida (0-100)',
      });
    }

    const phase = await ProjectPhase.findOneAndUpdate(
      { phaseNumber: parseInt(phaseNumber) },
      {
        percentage,
        status:
          percentage === 100
            ? 'Completato'
            : percentage > 0
              ? 'In corso'
              : 'In pianificazione',
      },
      { new: true, runValidators: true },
    );

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Progresso aggiornato',
      data: phase,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Errore nell'aggiornamento del progresso",
      error: error.message,
    });
  }
};

/**
 * Aggiungi media a una fase
 * @async
 */
exports.addPhaseMedia = async (req, res) => {
  try {
    const { phaseNumber } = req.params;
    const { type, url, title, description } = req.body;

    const phase = await ProjectPhase.findOne({
      phaseNumber: parseInt(phaseNumber),
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    const newMedia = {
      type,
      url,
      title,
      description,
      order: phase.media.length,
    };

    phase.media.push(newMedia);
    await phase.save();

    res.status(200).json({
      success: true,
      message: 'Media aggiunto con successo',
      data: phase,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Errore nell'aggiunta del media",
      error: error.message,
    });
  }
};

/**
 * Elimina una fase (admin)
 * @async
 */
exports.deletePhase = async (req, res) => {
  try {
    const { id } = req.params;
    const phase = await ProjectPhase.findByIdAndDelete(id);

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Fase non trovata',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fase eliminata con successo',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore nell'eliminazione della fase",
      error: error.message,
    });
  }
};
