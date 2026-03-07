// Esempio Componente LibroCard con Funzionalità Complete
import React, { useState } from 'react';
import './LibroCard.css';

const LibroCard = ({ libro, onDownloadSuccess }) => {
  const [localDownloads, setLocalDownloads] = useState(libro.downloads || 0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handler per incrementare views quando si clicca sulla card
  const handleView = async () => {
    try {
      await fetch(`/api/v1/libri/${libro._id}/views`, {
        method: 'PATCH',
      });
      console.log('✅ Views incrementate');
    } catch (error) {
      console.error('❌ Errore incremento views:', error);
    }
  };

  // Handler per "Leggi Online" - Apre PDF in nuova tab
  const handleLeggiOnline = async (e) => {
    e.stopPropagation();
    
    // Verifica che il file esista
    if (!libro.fileUrl) {
      alert('📚 Libro non ancora caricato. Riprova più tardi.');
      return;
    }
    
    // Incrementa views
    await handleView();
    
    // Apri PDF in nuova tab
    window.open(libro.fileUrl, '_blank');
  };

  // Handler per "Scarica" - Download + incrementa downloads
  const handleDownload = async (e) => {
    e.stopPropagation();
    
    // Verifica che il file esista
    if (!libro.fileUrl) {
      alert('📚 Libro non ancora caricato. Riprova più tardi.');
      return;
    }

    if (isDownloading) return; // Previeni click multipli
    
    try {
      setIsDownloading(true);

      // Incrementa contatore downloads nel backend
      const response = await fetch(`/api/v1/libri/${libro._id}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Errore nel server durante il download');
      }

      // Aggiorna il contatore locale
      const newDownloadCount = localDownloads + 1;
      setLocalDownloads(newDownloadCount);

      // Notifica il componente padre per aggiornare le statistiche totali
      if (onDownloadSuccess) {
        onDownloadSuccess(newDownloadCount);
      }

      // Metodo 1: Prova fetch con blob (più affidabile)
      try {
        const fileResponse = await fetch(libro.fileUrl);
        if (fileResponse.ok) {
          const blob = await fileResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${libro.title}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log('✅ Download avviato (metodo blob)');
        } else {
          throw new Error('File non disponibile');
        }
      } catch (fetchError) {
        // Metodo 2: Fallback con link diretto
        console.log('Fallback a download diretto');
        const link = document.createElement('a');
        link.href = libro.fileUrl;
        link.download = `${libro.title}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ Download avviato (metodo diretto)');
      }
      
    } catch (error) {
      console.error('❌ Errore download:', error);
      alert('Errore durante il download. Verifica che il file sia disponibile e riprova.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handler per errore caricamento immagine
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x400/cccccc/ffffff?text=Immagine+Non+Disponibile';
  };

  // Verifica se il libro è disponibile
  const isLibroDisponibile = Boolean(libro.fileUrl);

  return (
    <div className="libro-card" onClick={handleView}>
      {/* Badge Featured */}
      {libro.featured && (
        <div className="featured-badge">⭐ In Evidenza</div>
      )}

      {/* Badge Non Disponibile */}
      {!isLibroDisponibile && (
        <div className="unavailable-badge">📚 Non ancora caricato</div>
      )}

      {/* Immagine Cover */}
      <div className="libro-cover">
        <img
          src={libro.cover || 'https://via.placeholder.com/300x400/667eea/ffffff?text=No+Cover'}
          alt={libro.title}
          onError={handleImageError}
          loading="lazy"
        />
        {libro.anno && (
          <div className="anno-overlay">
            {libro.anno}
            {libro.trimestre && ` - Q${libro.trimestre}`}
          </div>
        )}
      </div>

      {/* Contenuto Card */}
      <div className="libro-content">
        <h3 className="libro-title">{libro.title}</h3>
        
        <p className="libro-author">
          <span className="icon">✍️</span> {libro.author}
        </p>

        <p className="libro-description">
          {libro.description.substring(0, 120)}...
        </p>

        {/* Tags */}
        <div className="libro-tags">
          <span className="tag">{libro.category}</span>
          {libro.language && <span className="tag">🌐 {libro.language.toUpperCase()}</span>}
        </div>

        {/* Stats */}
        <div className="libro-stats">
          <span className="stat">
            <span className="icon">👁️</span> {libro.views || 0} views
          </span>
          <span className="stat">
            <span className="icon">⬇️</span> {localDownloads.toLocaleString()} downloads
          </span>
          {libro.rating > 0 && (
            <span className="stat">
              <span className="icon">⭐</span> {libro.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="libro-actions">
          <button 
            className={`btn btn-primary ${!isLibroDisponibile ? 'disabled' : ''}`}
            onClick={handleLeggiOnline}
            disabled={!isLibroDisponibile}
            title={isLibroDisponibile ? "Apri il PDF in una nuova finestra" : "Libro non ancora disponibile"}
          >
            📖 Leggi Online
          </button>
          
          <button 
            className={`btn btn-secondary ${!isLibroDisponibile || isDownloading ? 'disabled' : ''}`}
            onClick={handleDownload}
            disabled={!isLibroDisponibile || isDownloading}
            title={isLibroDisponibile ? "Scarica il PDF sul tuo dispositivo" : "Libro non ancora disponibile"}
          >
            {isDownloading ? '⏳ Download...' : '⬇️ Scarica'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibroCard;
