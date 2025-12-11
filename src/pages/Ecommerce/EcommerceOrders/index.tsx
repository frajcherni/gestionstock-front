import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  Button,
  Input,
  Label,
  Form,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Alert,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import TableContainer from '../../../Components/Common/TableContainer';
import Loader from '../../../Components/Common/Loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import 'moment/locale/fr';
import classnames from 'classnames';

import { 
  fetchArticlesForInventaire, 
  fetchInventaires,
  createInventaire,
  //updateInventaire,
  type Inventaire,
  type InventaireItem
} from './InventaireServices';
import { Article } from '../../../Components/Article/Interfaces';

// Remove the old interfaces since we're importing them now

const InventairePage = () => {
  // États principaux
  const [activeView, setActiveView] = useState<'create' | 'list'>('create');
  const [articles, setArticles] = useState<Article[]>([]);
  const [inventaires, setInventaires] = useState<Inventaire[]>([]);
  const [filteredInventaires, setFilteredInventaires] = useState<Inventaire[]>([]);
  const [inventaireItems, setInventaireItems] = useState<Map<number, InventaireItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [inventairesLoading, setInventairesLoading] = useState(false);
  
  // États de recherche
  const [searchText, setSearchText] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [filteredArticlesSearch, setFilteredArticlesSearch] = useState<Article[]>([]);
  
  // États pour le scanner
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanningTimeout, setScanningTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // États des modales
  const [addModal, setAddModal] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [detailModal, setDetailModal] = useState<Inventaire | null>(null);
  const [editModal, setEditModal] = useState<Inventaire | null>(null);
  const [applying, setApplying] = useState(false);
  
  // État pour l'article à ajouter
  const [articleToAdd, setArticleToAdd] = useState<Article | null>(null);
  const [qteReel, setQteReel] = useState<string>('');
  const [inventaireDescription, setInventaireDescription] = useState('');
  const [inventaireNumero, setInventaireNumero] = useState('');

  // Charger les articles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchArticlesForInventaire();
        setArticles(data);
        setLoading(false);
      } catch (err) {
        toast.error('Erreur de chargement des articles');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Charger les inventaires quand on passe en vue liste
  useEffect(() => {
    if (activeView === 'list') {
      loadInventaires();
    }
  }, [activeView]);

  const loadInventaires = async () => {
    try {
      setInventairesLoading(true);
      const data = await fetchInventaires();
      setInventaires(data);
      setFilteredInventaires(data);
      setInventairesLoading(false);
    } catch (err) {
      toast.error('Erreur de chargement des inventaires');
      setInventairesLoading(false);
    }
  };

  // Générer le prochain numéro d'inventaire
  const generateNextNumero = () => {
    const currentYear = moment().format('YYYY');
    const prefix = 'INV';
    const lastNum = inventaires.reduce((max, inv) => {
      const match = inv.numero.match(new RegExp(`${prefix}-(\\d{4})/${currentYear}`));
      if (match) {
        const num = parseInt(match[1], 10);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    
    const nextNum = lastNum + 1;
    return `${prefix}-${nextNum.toString().padStart(4, '0')}/${currentYear}`;
  };

  // Scanner de code-barres
  const handleBarcodeScan = useCallback((barcode: string) => {
    if (!scannerEnabled || !barcode.trim()) return;
    
    const cleanBarcode = barcode.trim();
    const scannedArticle = articles.find(article => 
      article.code_barre === cleanBarcode
    );

    if (scannedArticle) {
      setArticleToAdd(scannedArticle);
      setQteReel(String(scannedArticle.qte || 0));
      setAddModal(true);
      toast.success(`Article "${scannedArticle.designation}" trouvé`);
    } else {
      toast.error(`Code-barres ${cleanBarcode} non trouvé`);
    }
  }, [scannerEnabled, articles]);

  // Gestionnaire de touche pour scanner
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!scannerEnabled) return;
    
    event.preventDefault();
    
    if (event.key === 'Enter') {
      if (barcodeInput.length > 0) {
        handleBarcodeScan(barcodeInput);
        setBarcodeInput("");
      }
    } else if (event.key.length === 1) {
      setBarcodeInput(prev => prev + event.key);
      
      if (scanningTimeout) {
        clearTimeout(scanningTimeout);
      }
      
      const newTimeout = setTimeout(() => {
        if (barcodeInput.length >= 3) {
          handleBarcodeScan(barcodeInput);
        }
        setBarcodeInput("");
      }, 150);
      
      setScanningTimeout(newTimeout);
    }
  }, [scannerEnabled, barcodeInput, scanningTimeout, handleBarcodeScan]);

  // Écouter les événements clavier
  useEffect(() => {
    if (scannerEnabled) {
      document.addEventListener('keydown', handleKeyPress);
    } else {
      document.removeEventListener('keydown', handleKeyPress);
      if (scanningTimeout) {
        clearTimeout(scanningTimeout);
      }
      setBarcodeInput("");
    }
  
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (scanningTimeout) {
        clearTimeout(scanningTimeout);
      }
    };
  }, [scannerEnabled, handleKeyPress]);

  // Recherche d'articles
  useEffect(() => {
    if (articleSearch.length >= 1) {
      const searchLower = articleSearch.toLowerCase();
      const filtered = articles.filter(
        (article) =>
          article.designation?.toLowerCase().includes(searchLower) ||
          article.reference?.toLowerCase().includes(searchLower) ||
          article.code_barre?.toLowerCase().includes(searchLower)
      );
      setFilteredArticlesSearch(filtered);
    } else {
      setFilteredArticlesSearch([]);
    }
  }, [articleSearch, articles]);

  // Ajouter un article à l'inventaire
  const handleAddToInventaire = () => {
    if (!articleToAdd || !qteReel) return;
    
    const qte = parseInt(qteReel) || 0;
    const pua_ht = articleToAdd.pua_ht || 0;
    const tva = articleToAdd.tva || 0;
    const pua_ttc = articleToAdd.pua_ttc || pua_ht * (1 + tva / 100);
    
    const total_ht = qte * pua_ht;
    const total_tva = total_ht * (tva / 100);
    const total_ttc = total_ht + total_tva;
    
    const inventaireItem: InventaireItem = {
      article: articleToAdd,
      qte_reel: qte,
      pua_ht,
      pua_ttc,
      tva,
      total_tva,
      total_ht,
      total_ttc
    };
    
    setInventaireItems(prev => new Map(prev.set(articleToAdd.id, inventaireItem)));
    setAddModal(false);
    setArticleToAdd(null);
    setQteReel('');
    setArticleSearch('');
    setFilteredArticlesSearch([]);
    
    toast.success('Article ajouté à l\'inventaire');
  };

  // Modifier la quantité
  const handleUpdateQte = (articleId: number, newQte: number) => {
    const item = inventaireItems.get(articleId);
    if (!item) return;
    
    const pua_ht = item.article.pua_ht || 0;
    const tva = item.article.tva || 0;
    const pua_ttc = item.article.pua_ttc || pua_ht * (1 + tva / 100);
    
    const total_ht = newQte * pua_ht;
    const total_tva = total_ht * (tva / 100);
    const total_ttc = total_ht + total_tva;
    
    const updatedItem: InventaireItem = {
      ...item,
      qte_reel: newQte,
      pua_ttc,
      total_tva,
      total_ht,
      total_ttc
    };
    
    setInventaireItems(prev => new Map(prev.set(articleId, updatedItem)));
  };

  // Supprimer un article
  const handleRemoveFromInventaire = (articleId: number) => {
    setInventaireItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(articleId);
      return newMap;
    });
    toast.success('Article retiré de l\'inventaire');
  };

  // Appliquer l'inventaire
// In your component file
// In your component, update the handleApplyInventaire function:
const handleApplyInventaire = async () => {
  if (inventaireItems.size === 0) {
    toast.warning('Aucun article dans l\'inventaire');
    return;
  }
  
  try {
    setApplying(true);
    
    // Prepare simple data
    const inventaireData = {
      numero: inventaireNumero || generateNextNumero(),
      date: moment().format('YYYY-MM-DD'),
      description: inventaireDescription,
      articles: Array.from(inventaireItems.values()).map(item => ({
        article_id: item.article.id,  // Just article_id and qte_reel
        qte_reel: item.qte_reel
      }))
    };
    
    console.log('Creating inventaire:', inventaireData);
    
    // Create inventaire
    await createInventaire({
      numero: inventaireNumero || generateNextNumero(),
      date: moment().format('YYYY-MM-DD'),
      description: inventaireDescription,
      articles: Array.from(inventaireItems.values())
    });
    
    toast.success(`Inventaire créé pour ${inventaireItems.size} article(s)`);
    
    // Reset
    setInventaireItems(new Map());
    setInventaireDescription('');
    setInventaireNumero('');
    setApplyModal(false);
    
    // Reload data
    const articlesData = await fetchArticlesForInventaire();
    setArticles(articlesData);
    
    if (activeView === 'list') {
      await loadInventaires();
    }
    
  } catch (err: any) {
    console.error('Error creating inventaire:', err);
    toast.error(err.message || 'Erreur lors de la création de l\'inventaire');
  } finally {
    setApplying(false);
  }
};
  // Modifier un inventaire
  const handleEditInventaire = async (inventaire: Inventaire) => {
    setEditModal(inventaire);
    setInventaireItems(new Map(
      inventaire.articles.map(item => [item.article.id, item])
    ));
    setInventaireDescription(inventaire.description || '');
    setInventaireNumero(inventaire.numero);
    setActiveView('create');
  };

  const handleSaveEdit = async () => {
    if (!editModal || inventaireItems.size === 0) return;
    
    try {
      setApplying(true);
      
      const ajustements = Array.from(inventaireItems.values()).map(item => ({
        article_id: item.article.id,
        nouveau_qte: item.qte_reel,
        commentaire: 'Mise à jour inventaire'
      }));
      
      // Appliquer les ajustements
     // await applyInventaire(ajustements);
      
      const inventaireData = {
        numero: inventaireNumero,
        date: editModal.date,
        description: inventaireDescription,
        articles: Array.from(inventaireItems.values())
      };
      
      // Mettre à jour l'inventaire
      //await updateInventaire(editModal.id, inventaireData);
      
      toast.success('Inventaire modifié avec succès');
      
      setEditModal(null);
      setInventaireItems(new Map());
      setInventaireDescription('');
      setInventaireNumero('');
      
      // Recharger
      if (activeView === 'list') {
        await loadInventaires();
      }
      
    } catch (err: any) {
      console.error('Error updating inventaire:', err);
      toast.error(err.message || 'Erreur lors de la modification');
    } finally {
      setApplying(false);
    }
  };

  // Exporter en PDF
  const handleExportPDF = (inventaire: Inventaire) => {
    // Logique PDF ici
    toast.success(`PDF pour ${inventaire.numero} généré`);
  };

  // Calculer les totaux
  const totals = useMemo(() => {
    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;
    let totalDifference = 0;
    
    inventaireItems.forEach(item => {
      totalHT += item.total_ht;
      totalTVA += item.total_tva;
      totalTTC += item.total_ttc;
      totalDifference += (item.qte_reel - (item.article.qte || 0));
    });
    
    return {
      totalHT: totalHT.toFixed(2),
      totalTVA: totalTVA.toFixed(2),
      totalTTC: totalTTC.toFixed(2),
      totalDifference,
      itemCount: inventaireItems.size
    };
  }, [inventaireItems]);

  // Colonnes pour la table des inventaires
  const columns = useMemo(
    () => [
      {
        header: 'Numéro',
        accessorKey: 'numero',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <a 
            href="#" 
            className="text-body fw-medium" 
            onClick={(e) => {
              e.preventDefault();
              setDetailModal(cell.row.original);
            }}
          >
            {cell.getValue()}
          </a>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'date',
        enableColumnFilter: false,
        cell: (cell: any) => moment(cell.getValue()).format('DD MMM YYYY'),
      },
      {
        header: 'Description',
        accessorKey: 'description',
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue() || '-',
      },
      {
        header: 'Articles',
        accessorKey: 'articles',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <Badge color="info" className="text-uppercase">
            {cell.getValue().length} articles
          </Badge>
        ),
      },
      {
        header: 'Valeur TTC',
        accessorKey: 'articles',
        enableColumnFilter: false,
        cell: (cell: any) => {
          const total = cell.getValue().reduce(
            (sum: number, item: InventaireItem) => sum + item.total_ttc,
            0
          );
          return `${total.toFixed(2)} TND`;
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        enableColumnFilter: false,
        cell: (cell: any) => (
          <Badge color={cell.getValue() === 'Terminé' ? 'success' : 'warning'}>
            {cell.getValue()}
          </Badge>
        ),
      },
      {
        header: 'Actions',
        cell: (cellProps: any) => {
          const inventaire = cellProps.row.original;
          return (
            <div className="d-flex gap-2">
              <Button color="light" size="sm" onClick={() => setDetailModal(inventaire)}>
                <i className="ri-eye-line"></i>
              </Button>
              <Button color="primary" size="sm" onClick={() => handleEditInventaire(inventaire)}>
                <i className="ri-pencil-line"></i>
              </Button>
              <Button color="success" size="sm" onClick={() => handleExportPDF(inventaire)}>
                <i className="ri-download-line"></i>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Filtrer les inventaires
  useEffect(() => {
    if (!searchText) {
      setFilteredInventaires(inventaires);
    } else {
      const searchLower = searchText.toLowerCase();
      const filtered = inventaires.filter(inv => 
        inv.numero.toLowerCase().includes(searchLower) ||
        (inv.description && inv.description.toLowerCase().includes(searchLower))
      );
      setFilteredInventaires(filtered);
    }
  }, [searchText, inventaires]);

  // VUE CRÉER/SCANNER
  const renderCreateView = () => (
    <Card>
      <CardHeader className="border-0">
        <Row className="align-items-center g-3">
          <Col md={4}>
            <h5 className="card-title mb-0">
              {editModal ? 'Modifier Inventaire' : 'Nouvel Inventaire'}
            </h5>
            <p className="text-muted mb-0">Scanner et ajuster les quantités réelles</p>
          </Col>
          <Col md={8}>
            <div className="d-flex justify-content-end gap-2">
              <Button 
                color={scannerEnabled ? 'success' : 'outline-secondary'}
                onClick={() => setScannerEnabled(!scannerEnabled)}
              >
                <i className="ri-barcode-line me-1"></i>
                {scannerEnabled ? 'Scanner Actif' : 'Scanner'}
              </Button>
              
              <Button 
                color="primary"
                onClick={() => setApplyModal(true)}
                disabled={inventaireItems.size === 0}
              >
                <i className="ri-check-double-line me-1"></i>
                {editModal ? 'Mettre à jour' : 'Créer'} ({inventaireItems.size})
              </Button>
              
              {editModal && (
                <Button 
                  color="light"
                  onClick={() => {
                    setEditModal(null);
                    setInventaireItems(new Map());
                    setInventaireDescription('');
                    setInventaireNumero('');
                  }}
                >
                  Annuler
                </Button>
              )}
            </div>
          </Col>
        </Row>
        
        {scannerEnabled && (
          <Row className="mt-3">
            <Col md={12}>
              <Alert color="info" className="mb-0 py-2">
                <div className="d-flex align-items-center">
                  <i className="ri-barcode-box-line fs-5 me-2"></i>
                  <div>
                    <span className="fw-semibold">Mode Scanner Activé</span>
                    <small className="d-block text-muted">
                      Scannez un code-barres pour ajouter rapidement l'article
                    </small>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>
        )}
      </CardHeader>
      
      <CardBody className="pt-0">
        {editModal && (
          <Row className="mb-3">
            <Col md={6}>
              <FormGroup>
                <Label>Numéro d'inventaire</Label>
                <Input 
                  value={inventaireNumero} 
                  onChange={(e) => setInventaireNumero(e.target.value)} 
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Description</Label>
                <Input 
                  value={inventaireDescription}
                  onChange={(e) => setInventaireDescription(e.target.value)}
                  placeholder="Description de l'inventaire..."
                />
              </FormGroup>
            </Col>
          </Row>
        )}

        {/* Recherche d'article */}
        <Row className="mb-4">
          <Col md={8}>
            <div className="search-box position-relative">
              <Input
                type="text"
                placeholder="Rechercher article par référence, désignation ou code-barres..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="ps-4"
              />
              <i className="ri-search-line search-icon"></i>
              
              {articleSearch.length >= 1 && (
                <div className="search-results mt-2 border rounded shadow-sm position-absolute w-100 bg-white z-3">
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredArticlesSearch.length > 0 ? (
                      filteredArticlesSearch.map(article => (
                        <div
                          key={article.id}
                          className="search-result-item p-3 border-bottom"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setArticleToAdd(article);
                            setQteReel(String(article.qte || 0));
                            setAddModal(true);
                            setArticleSearch('');
                            setFilteredArticlesSearch([]);
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{article.reference}</strong>
                              <div className="text-muted small">{article.designation}</div>
                              <div className="d-flex gap-2 mt-1">
                                {article.code_barre && (
                                  <Badge color="light" className="text-dark">
                                    <i className="ri-barcode-line me-1"></i>
                                    {article.code_barre}
                                  </Badge>
                                )}
                                <Badge color="info">
                                  Stock: {article.qte || 0}
                                </Badge>
                              </div>
                            </div>
                            <Badge color="success">
                              <i className="ri-add-line me-1"></i>
                              Ajouter
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted p-3 text-center">
                        <i className="ri-search-line me-2"></i>
                        Aucun article trouvé
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
        
        {/* Tableau d'inventaire */}
        {inventaireItems.size === 0 ? (
          <div className="text-center py-5">
            <i className="ri-inbox-line fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">Aucun article dans l'inventaire</h5>
            <p className="text-muted">
              Utilisez la recherche ou le scanner pour ajouter des articles
            </p>
          </div>
        ) : (
          <>
            {/* Totaux */}
            <Row className="mb-3">
              <Col md={12}>
                <Card className="border-dashed">
                  <CardBody className="p-3">
                    <Row className="g-3">
                      <Col sm={6} md={3}>
                        <div className="text-center">
                          <h6 className="text-muted mb-1">Articles</h6>
                          <h4 className="fw-bold">{totals.itemCount}</h4>
                        </div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="text-center">
                          <h6 className="text-muted mb-1">Différence totale</h6>
                          <h4 className={`fw-bold ${totals.totalDifference !== 0 ? 'text-warning' : ''}`}>
                            {totals.totalDifference} unités
                          </h4>
                        </div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="text-center">
                          <h6 className="text-muted mb-1">Total HT</h6>
                          <h4 className="fw-bold text-primary">
                            {totals.totalHT} TND
                          </h4>
                        </div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="text-center">
                          <h6 className="text-muted mb-1">Total TTC</h6>
                          <h4 className="fw-bold text-success">
                            {totals.totalTTC} TND
                          </h4>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
            
            {/* Table des articles d'inventaire */}
            <div className="table-responsive">
              <Table className="table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Article</th>
                    <th className="text-center">Stock Actuel</th>
                    <th className="text-center">Quantité Réelle</th>
                    <th className="text-center">Prix Unitaire HT</th>
                    <th className="text-center">TVA</th>
                    <th className="text-center">Total HT</th>
                    <th className="text-center">Total TTC</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(inventaireItems.values()).map((item) => {
                    const difference = item.qte_reel - (item.article.qte || 0);
                    
                    return (
                      <tr key={item.article.id}>
                        <td>
                          <div>
                            <h6 className="mb-1">{item.article.designation}</h6>
                            <p className="text-muted mb-0">
                              <small>Réf: {item.article.reference}</small>
                            </p>
                          </div>
                        </td>
                        
                        <td className="text-center">
                          <Badge color="secondary">
                            {item.article.qte || 0}
                          </Badge>
                        </td>
                        
                        <td className="text-center">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={item.qte_reel}
                            onChange={(e) => {
                              const newQte = parseInt(e.target.value) || 0;
                              handleUpdateQte(item.article.id, newQte);
                            }}
                            className="text-center"
                            style={{ width: '80px' }}
                          />
                          {difference !== 0 && (
                            <small className={`d-block mt-1 ${difference > 0 ? 'text-success' : 'text-danger'}`}>
                              {difference > 0 ? '+' : ''}{difference}
                            </small>
                          )}
                        </td>
                        
                        <td className="text-center">
                          <strong className="text-primary">
                            {item.pua_ht.toFixed(2)} TND
                          </strong>
                        </td>
                        
                        <td className="text-center">
                          <Badge color="info">
                            {item.tva}%
                          </Badge>
                        </td>
                        
                        <td className="text-center">
                          <strong>
                            {item.total_ht.toFixed(2)} TND
                          </strong>
                        </td>
                        
                        <td className="text-center">
                          <strong className="text-success">
                            {item.total_ttc.toFixed(2)} TND
                          </strong>
                        </td>
                        
                        <td className="text-center">
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleRemoveFromInventaire(item.article.id)}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );

  // VUE LISTE DES INVENTAIRES
  const renderListView = () => (
    <Card>
      <CardHeader>
        <Row className="align-items-center">
          <Col sm={6}>
            <h5 className="card-title mb-0">Historique des Inventaires</h5>
          </Col>
          <Col sm={6} className="text-end">
            <Button color="primary" onClick={() => setActiveView('create')}>
              <i className="ri-add-line align-bottom me-1"></i> Nouvel Inventaire
            </Button>
          </Col>
        </Row>
      </CardHeader>

      <CardBody>
        <Row className="mb-3">
          <Col md={6}>
            <div className="search-box">
              <Input
                type="text"
                className="form-control"
                placeholder="Rechercher inventaire..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
          </Col>
        </Row>

        {inventairesLoading ? (
          <Loader />
        ) : filteredInventaires.length === 0 ? (
          <div className="text-center py-5">
            <i className="ri-inbox-line fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">Aucun inventaire trouvé</h5>
            <p className="text-muted">
              Créez votre premier inventaire en utilisant l'onglet "Créer/Scanner"
            </p>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredInventaires}
            isGlobalFilter={false}
            customPageSize={10}
            divClass="table-responsive"
          />
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Inventaire Physique" pageTitle="Stock" />
        
        {/* Onglets de navigation */}
        <Card className="mb-3">
          <CardBody className="p-0">
            <Nav tabs className="nav-tabs-custom">
              <NavItem>
                <NavLink
                  className={classnames({ active: activeView === 'create' })}
                  onClick={() => setActiveView('create')}
                >
                  <i className="ri-add-line me-1 align-bottom"></i> Créer/Scanner
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeView === 'list' })}
                  onClick={() => setActiveView('list')}
                >
                  <i className="ri-list-check-2 me-1 align-bottom"></i> Liste des Inventaires
                </NavLink>
              </NavItem>
            </Nav>
          </CardBody>
        </Card>
        
        <Row>
          <Col lg={12}>
            {activeView === 'create' ? renderCreateView() : renderListView()}
          </Col>
        </Row>
      </Container>
      
      {/* Modal d'ajout d'article */}
      <Modal isOpen={addModal} toggle={() => setAddModal(false)} centered>
        <ModalHeader toggle={() => setAddModal(false)}>
          <i className="ri-add-line me-2"></i>
          Ajouter à l'inventaire
        </ModalHeader>
        <ModalBody>
          {articleToAdd && (
            <div>
              <div className="d-flex align-items-center mb-3">
                <div>
                  <h6 className="mb-1">{articleToAdd.designation}</h6>
                  <p className="text-muted mb-0">Réf: {articleToAdd.reference}</p>
                </div>
              </div>
              
              <Row className="mb-3">
                <Col md={6}>
                  <div className="text-center p-3 border rounded bg-light">
                    <small className="text-muted d-block">Stock Actuel</small>
                    <h4 className="text-primary mb-0">{articleToAdd.qte || 0}</h4>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center p-3 border rounded bg-light">
                    <small className="text-muted d-block">Prix Achat HT</small>
                    <h4 className="text-success mb-0">
                      {(articleToAdd.pua_ht || 0).toFixed(2)} TND
                    </h4>
                  </div>
                </Col>
              </Row>
              
              <FormGroup>
                <Label>Quantité Réelle</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={qteReel}
                  onChange={(e) => setQteReel(e.target.value)}
                  className="text-center fs-4"
                  autoFocus
                />
              </FormGroup>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setAddModal(false)}>
            Annuler
          </Button>
          <Button color="primary" onClick={handleAddToInventaire}>
            Ajouter à l'inventaire
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Modal d'application d'inventaire */}
      <Modal isOpen={applyModal} toggle={() => setApplyModal(false)} centered>
        <ModalHeader toggle={() => setApplyModal(false)}>
          <i className="ri-check-double-line me-2"></i>
          {editModal ? 'Mettre à jour l\'Inventaire' : 'Créer l\'Inventaire'}
        </ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <i className="ri-alert-line me-2"></i>
            {editModal 
              ? `Vous êtes sur le point de mettre à jour l'inventaire ${editModal.numero}`
              : `Vous êtes sur le point de créer un nouvel inventaire`
            } pour {inventaireItems.size} article(s).
            Cette action mettra à jour définitivement les quantités en stock.
          </Alert>
          
          {!editModal && (
            <div className="mb-3">
              <FormGroup>
                <Label>Numéro d'inventaire</Label>
                <Input 
                  value={inventaireNumero} 
                  onChange={(e) => setInventaireNumero(e.target.value)}
                  placeholder="Numéro auto-généré"
                />
              </FormGroup>
              <FormGroup>
                <Label>Description (optionnel)</Label>
                <Input 
                  value={inventaireDescription}
                  onChange={(e) => setInventaireDescription(e.target.value)}
                  placeholder="Description..."
                />
              </FormGroup>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setApplyModal(false)} disabled={applying}>
            Annuler
          </Button>
          <Button color="primary" onClick={editModal ? handleSaveEdit : handleApplyInventaire} disabled={applying}>
            {applying ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                {editModal ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              editModal ? 'Mettre à jour' : 'Confirmer et Créer'
            )}
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Modal détails inventaire */}
      <Modal isOpen={!!detailModal} toggle={() => setDetailModal(null)} size="lg">
        <ModalHeader toggle={() => setDetailModal(null)}>
          Détails Inventaire #{detailModal?.numero}
        </ModalHeader>
        <ModalBody>
          {detailModal && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Date:</strong> {moment(detailModal.date).format('DD/MM/YYYY')}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Statut:</strong> 
                    <Badge color={detailModal.status === 'Terminé' ? 'success' : 'warning'} className="ms-2">
                      {detailModal.status}
                    </Badge>
                  </p>
                </Col>
                {detailModal.description && (
                  <Col md={12}>
                    <p><strong>Description:</strong> {detailModal.description}</p>
                  </Col>
                )}
              </Row>
              
              <div className="table-responsive">
                <Table>
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th className="text-center">Quantité Réelle</th>
                      <th className="text-center">Total HT</th>
                      <th className="text-center">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailModal.articles.map((item) => (
                      <tr key={item.article.id}>
                        <td>
                          <div>
                            <strong>{item.article.designation}</strong>
                            <div className="text-muted small">Réf: {item.article.reference}</div>
                          </div>
                        </td>
                        <td className="text-center">{item.qte_reel}</td>
                        <td className="text-center">{item.total_ht.toFixed(2)} TND</td>
                        <td className="text-center">{item.total_ttc.toFixed(2)} TND</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              <div className="text-end mt-3">
                <h5>
                  Total TTC: {detailModal.articles.reduce((sum, item) => sum + item.total_ttc, 0).toFixed(2)} TND
                </h5>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setDetailModal(null)}>
            Fermer
          </Button>
          {detailModal && (
            <Button color="primary" onClick={() => handleExportPDF(detailModal)}>
              <i className="ri-download-line me-1"></i> PDF
            </Button>
          )}
        </ModalFooter>
      </Modal>
      
      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default InventairePage;