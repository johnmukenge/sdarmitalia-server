# 🎨 Frontend React - Integrazione Lezionari

## 📋 Esempio Completo: Pagina Lezionari

### File: `src/pages/LezionariPage.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Card, Select, Badge, Button, Spin, Empty } from 'antd';
import { DownloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import './LezionariPage.css';

const { Option } = Select;

const LezionariPage = () => {
  const [lezionari, setLezionari] = useState([]);
  const [anni, setAnni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    anno: '',
    trimestre: '',
    tipo: 'lezionario' // o 'settimana_preghiera'
  });

  // Carica anni disponibili
  useEffect(() => {
    fetch('/api/v1/libri/anni-disponibili')
      .then(res => res.json())
      .then(data => {
        setAnni(data.data.anni);
      })
      .catch(err => console.error('Errore caricamento anni:', err));
  }, []);

  // Carica lezionari/settimane in base ai filtri
  useEffect(() => {
    setLoading(true);
    
    let url = '';
    const params = new URLSearchParams();
    
    if (filters.tipo === 'lezionario') {
      url = '/api/v1/libri/lezionari';
      if (filters.anno) params.append('anno', filters.anno);
      if (filters.trimestre) params.append('trimestre', filters.trimestre);
    } else {
      url = '/api/v1/libri/settimane-preghiera';
      if (filters.anno) params.append('anno', filters.anno);
    }
    
    if (params.toString()) url += '?' + params.toString();
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const items = filters.tipo === 'lezionario' 
          ? data.data.lezionari 
          : data.data.settimane;
        setLezionari(items);
        setLoading(false);
      })
      .catch(err => {
        console.error('Errore:', err);
        setLoading(false);
      });
  }, [filters]);

  // Incrementa views quando si clicca su un libro
  const handleView = async (libroId) => {
    await fetch(`/api/v1/libri/${libroId}/views`, {
      method: 'PATCH'
    });
  };

  // Incrementa downloads quando si scarica
  const handleDownload = async (libro) => {
    // Incrementa contatore
    await fetch(`/api/v1/libri/${libro._id}/download`, {
      method: 'POST'
    });
    
    // Apri il PDF
    window.open(libro.fileUrl, '_blank');
  };

  return (
    <div className="lezionari-page">
      {/* Header */}
      <div className="page-header">
        <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        <h1>Biblioteca Digitale</h1>
        <p>Lezionari Biblici e Settimane di Preghiera</p>
      </div>

      {/* Filtri */}
      <div className="filtri-container">
        <Select
          placeholder="Tipo documento"
          value={filters.tipo}
          onChange={(value) => setFilters({...filters, tipo: value, trimestre: ''})}
          style={{ width: 200 }}
        >
          <Option value="lezionario">
            📚 Lezionari
          </Option>
          <Option value="settimana_preghiera">
            🙏 Settimane di Preghiera
          </Option>
        </Select>

        <Select
          placeholder="Seleziona anno"
          value={filters.anno}
          onChange={(value) => setFilters({...filters, anno: value})}
          style={{ width: 150 }}
          allowClear
        >
          {anni.map(anno => (
            <Option key={anno} value={anno}>{anno}</Option>
          ))}
        </Select>

        {filters.tipo === 'lezionario' && (
          <Select
            placeholder="Trimestre"
            value={filters.trimestre}
            onChange={(value) => setFilters({...filters, trimestre: value})}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="1">1° Trimestre (Gen-Mar)</Option>
            <Option value="2">2° Trimestre (Apr-Giu)</Option>
            <Option value="3">3° Trimestre (Lug-Set)</Option>
            <Option value="4">4° Trimestre (Ott-Dic)</Option>
          </Select>
        )}

        <Button 
          onClick={() => setFilters({...filters, anno: '', trimestre: ''})}
          type="link"
        >
          Azzera filtri
        </Button>
      </div>

      {/* Risultati */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="Caricamento in corso..." />
        </div>
      ) : lezionari.length === 0 ? (
        <Empty 
          description="Nessun documento trovato con i filtri selezionati"
          style={{ marginTop: 50 }}
        />
      ) : (
        <div className="lezionari-grid">
          {lezionari.map(libro => (
            <Card
              key={libro._id}
              hoverable
              className={`libro-card ${libro.featured ? 'featured' : ''}`}
              onClick={() => handleView(libro._id)}
              cover={
                libro.cover ? (
                  <img alt={libro.title} src={libro.cover} />
                ) : (
                  <div className="default-cover">
                    <FileTextOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                  </div>
                )
              }
            >
              {/* Badge Featured */}
              {libro.featured && (
                <Badge.Ribbon text="In Evidenza" color="gold" />
              )}

              {/* Contenuto Card */}
              <Card.Meta
                title={
                  <div className="card-title">
                    {libro.title}
                    {libro.anno && (
                      <span className="anno-badge">{libro.anno}</span>
                    )}
                  </div>
                }
                description={
                  <div className="card-description">
                    <p>{libro.description.substring(0, 120)}...</p>
                    
                    {/* Tags Anno e Trimestre */}
                    <div className="tags">
                      {libro.anno && (
                        <Badge count={`Anno ${libro.anno}`} style={{ backgroundColor: '#108ee9' }} />
                      )}
                      {libro.trimestre && (
                        <Badge count={`Q${libro.trimestre}`} style={{ backgroundColor: '#87d068' }} />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="stats">
                      <span><EyeOutlined /> {libro.views || 0} visualizzazioni</span>
                      <span><DownloadOutlined /> {libro.downloads || 0} download</span>
                    </div>

                    {/* Actions */}
                    <div className="actions">
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(libro);
                        }}
                        block
                      >
                        Scarica PDF
                      </Button>
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && lezionari.length > 0 && (
        <div className="stats-footer">
          <p>
            Trovati <strong>{lezionari.length}</strong> documenti
            {filters.anno && ` per l'anno ${filters.anno}`}
            {filters.trimestre && ` - Trimestre ${filters.trimestre}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default LezionariPage;
```

---

## 🎨 CSS: `src/pages/LezionariPage.css`

```css
.lezionari-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 20px 0 10px;
  color: #1a1a1a;
}

.page-header p {
  font-size: 1.1rem;
  color: #666;
}

.filtri-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.lezionari-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.libro-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.libro-card.featured {
  border: 2px solid #faad14;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
}

.libro-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.default-cover {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.anno-badge {
  background: #1890ff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-description {
  margin-top: 15px;
}

.card-description p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
  color: #666;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.actions {
  margin-top: 15px;
}

.stats-footer {
  text-align: center;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  color: #666;
}

.stats-footer strong {
  color: #1890ff;
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .lezionari-grid {
    grid-template-columns: 1fr;
  }
  
  .filtri-container {
    flex-direction: column;
  }
  
  .filtri-container > * {
    width: 100% !important;
  }
}
```

---

## 🔗 Routing: Aggiungi al Router

```jsx
// src/App.jsx o src/router.jsx
import LezionariPage from './pages/LezionariPage';

// Nel router:
<Route path="/biblioteca/lezionari" element={<LezionariPage />} />
```

---

## 🧩 Componente Riusabile: LibroCard

Per riusare il componente in altre sezioni:

```jsx
// src/components/LibroCard.jsx
import { Card, Badge, Button } from 'antd';
import { DownloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';

const LibroCard = ({ libro, onDownload, onView }) => {
  return (
    <Card
      hoverable
      className={`libro-card ${libro.featured ? 'featured' : ''}`}
      onClick={() => onView?.(libro._id)}
      cover={
        libro.cover ? (
          <img alt={libro.title} src={libro.cover} />
        ) : (
          <div className="default-cover">
            <FileTextOutlined style={{ fontSize: 64, color: '#1890ff' }} />
          </div>
        )
      }
    >
      {libro.featured && <Badge.Ribbon text="In Evidenza" color="gold" />}
      
      <Card.Meta
        title={
          <div className="card-title">
            {libro.title}
            {libro.anno && <span className="anno-badge">{libro.anno}</span>}
          </div>
        }
        description={
          <div className="card-description">
            <p>{libro.description.substring(0, 120)}...</p>
            
            <div className="tags">
              {libro.anno && <Badge count={`Anno ${libro.anno}`} />}
              {libro.trimestre && <Badge count={`Q${libro.trimestre}`} />}
              <Badge count={libro.category} style={{ backgroundColor: '#52c41a' }} />
            </div>

            <div className="stats">
              <span><EyeOutlined /> {libro.views || 0}</span>
              <span><DownloadOutlined /> {libro.downloads || 0}</span>
            </div>

            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(libro);
              }}
              block
            >
              Scarica PDF
            </Button>
          </div>
        }
      />
    </Card>
  );
};

export default LibroCard;
```

---

## 📱 Versione Semplificata (senza Ant Design)

```jsx
// Vanilla React + CSS
const LezionariPage = () => {
  const [lezionari, setLezionari] = useState([]);
  const [anni, setAnni] = useState([]);
  const [filters, setFilters] = useState({ anno: '', trimestre: '' });

  useEffect(() => {
    fetch('/api/v1/libri/anni-disponibili')
      .then(res => res.json())
      .then(data => setAnni(data.data.anni));
  }, []);

  useEffect(() => {
    let url = '/api/v1/libri/lezionari';
    const params = [];
    if (filters.anno) params.push(`anno=${filters.anno}`);
    if (filters.trimestre) params.push(`trimestre=${filters.trimestre}`);
    if (params.length) url += '?' + params.join('&');

    fetch(url)
      .then(res => res.json())
      .then(data => setLezionari(data.data.lezionari));
  }, [filters]);

  return (
    <div className="lezionari-page">
      <h1>📚 Lezionari Biblici</h1>
      
      {/* Filtri */}
      <div className="filters">
        <select onChange={(e) => setFilters({...filters, anno: e.target.value})}>
          <option value="">Tutti gli anni</option>
          {anni.map(anno => (
            <option key={anno} value={anno}>{anno}</option>
          ))}
        </select>

        <select onChange={(e) => setFilters({...filters, trimestre: e.target.value})}>
          <option value="">Tutti i trimestri</option>
          <option value="1">Q1 (Gen-Mar)</option>
          <option value="2">Q2 (Apr-Giu)</option>
          <option value="3">Q3 (Lug-Set)</option>
          <option value="4">Q4 (Ott-Dic)</option>
        </select>
      </div>

      {/* Grid */}
      <div className="books-grid">
        {lezionari.map(libro => (
          <div key={libro._id} className="book-card">
            {libro.featured && <span className="badge">⭐ In Evidenza</span>}
            <h3>{libro.title}</h3>
            <p>{libro.description}</p>
            <div className="meta">
              <span>📅 {libro.anno}</span>
              <span>📖 Q{libro.trimestre}</span>
              <span>👁️ {libro.views}</span>
              <span>⬇️ {libro.downloads}</span>
            </div>
            <a 
              href={libro.fileUrl} 
              target="_blank"
              onClick={() => fetch(`/api/v1/libri/${libro._id}/download`, { method: 'POST' })}
            >
              Scarica PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🎯 Best Practices

1. **Lazy Loading**: Carica le immagini cover in modo lazy
2. **Error Handling**: Gestisci errori di rete con try-catch
3. **Loading States**: Mostra spinner durante il caricamento
4. **Empty States**: Mostra messaggio quando non ci sono risultati
5. **Accessibility**: Usa semantic HTML e aria-labels
6. **SEO**: Usa meta tags appropriati per i lezionari
7. **Analytics**: Traccia download e views con Google Analytics

---

## 🔌 Hook Personalizzato

```jsx
// src/hooks/useLezionari.js
import { useState, useEffect } from 'react';

export const useLezionari = (filters = {}) => {
  const [lezionari, setLezionari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.anno) params.append('anno', filters.anno);
    if (filters.trimestre) params.append('trimestre', filters.trimestre);

    fetch(`/api/v1/libri/lezionari?${params}`)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        setLezionari(data.data.lezionari);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [filters.anno, filters.trimestre]);

  const incrementViews = async (id) => {
    await fetch(`/api/v1/libri/${id}/views`, { method: 'PATCH' });
  };

  const downloadLibro = async (libro) => {
    await fetch(`/api/v1/libri/${libro._id}/download`, { method: 'POST' });
    window.open(libro.fileUrl, '_blank');
  };

  return { lezionari, loading, error, incrementViews, downloadLibro };
};

// Uso:
const { lezionari, loading, downloadLibro } = useLezionari({ anno: 2026, trimestre: 1 });
```

---

**🎉 Frontend pronto per integrare i Lezionari nella Biblioteca Digitale!**
