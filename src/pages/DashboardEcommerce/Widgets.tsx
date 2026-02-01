
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';  // Ajoutez 'pdf' ici
import { useProfile } from "Components/Hooks/UserHooks";
import logo from "../../assets/images/imglogo.png";
import { Card, CardBody, Col, Row, Container, Label, Button, Table, Badge, Modal, ModalHeader, ModalBody } from 'reactstrap';  // Ajoutez Modal, ModalHeader, ModalBody
import CountUp from "react-countup";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import TrésoreriePDF from './TrésoreriePDF ';


const API_BASE = process.env.REACT_APP_API_BASE;

interface PaymentMethod {
  method: string;
  amount: number;
  numero?: string;
  banque?: string;
  dateEcheance?: string;
  tauxRetention?: number;
}

interface Transaction {
  id: number;
  type: 'facture_direct' | 'encaissement' | 'paiement_bc' | 'bon_commande' | 'vente_comptoire';
  numero: string;
  date: string;
  client: Client;
  montant: number;
  paymentMethods: PaymentMethod[];
  hasRetenue?: boolean;
  montantRetenue?: number;
  source?: string;
}

interface Client {
  name : string
}
interface TrésorerieData {
  totalVentes: number;
  totalPaiementsClients: number;
  totalPaiementsFournisseurs: number;
  earnings: number;
  paymentMethods: {
    especes: number;
    cheque: number;
    virement: number;
    traite: number;
    autre: number;
    retenue: number;
  };
  paymentMethodsBySource: {
    bcPayments: {
      especes: number;
      cheque: number;
      virement: number;
      traite: number;
      autre: number;
    };
    facturePayments: {
      especes: number;
      cheque: number;
      virement: number;
      traite: number;
      autre: number;
    };
    ventePayments: {
      especes: number;
      cheque: number;
      virement: number;
      traite: number;
      autre: number;
    };
  };
  transactions: Transaction[];
  counts: {
    ventes: number;
    encaissements: number;
    paiementsFournisseurs: number;
    factures: number;
    bonCommandes: number;
    paiementsBC: number;
    totalTransactions: number;
  };
}

const Trésorerie: React.FC = () => {
  const [data, setData] = useState<TrésorerieData>({
    totalVentes: 0,
    totalPaiementsClients: 0,
    totalPaiementsFournisseurs: 0,
    earnings: 0,
    paymentMethods: {
      especes: 0,
      cheque: 0,
      virement: 0,
      traite: 0,
      autre: 0,
      retenue: 0
    },
    paymentMethodsBySource: {
      bcPayments: { especes: 0, cheque: 0, virement: 0, traite: 0, autre: 0 },
      facturePayments: { especes: 0, cheque: 0, virement: 0, traite: 0, autre: 0 },
      ventePayments: { especes: 0, cheque: 0, virement: 0, traite: 0, autre: 0 }
    },
    transactions: [],
    counts: {
      ventes: 0,
      encaissements: 0,
      paiementsFournisseurs: 0,
      factures: 0,
      bonCommandes: 0,
      paiementsBC: 0,
      totalTransactions: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(moment().startOf('month').toDate());
  const [endDate, setEndDate] = useState<Date>(moment().endOf('month').toDate());
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');


  // À la ligne 86, après les autres états, ajoutez :
const [pdfModal, setPdfModal] = useState(false);
const [pdfUrl, setPdfUrl] = useState<string | null>(null);
const [generatingPdf, setGeneratingPdf] = useState(false);
const iframeRef = useRef<HTMLIFrameElement>(null);


// À la ligne 180 (après le useEffect), ajoutez ces fonctions :

// Fonction pour afficher le PDF dans une modal
const handleViewPdf = async () => {
  try {
    setGeneratingPdf(true);
    
    // Créer le composant PDF
    const pdfComponent = <TrésoreriePDF data={data} companyInfo={companyInfo} dateRange={{ startDate, endDate }} />;
    
    // Convertir en blob
    const pdfBlob = await pdf(pdfComponent).toBlob();
    
    // Créer une URL pour le blob
    const blobUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(blobUrl);
    
    // Ouvrir la modal
    setPdfModal(true);
    setGeneratingPdf(false);
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    setGeneratingPdf(false);
    alert('Erreur lors de la génération du PDF');
  }
};

// Fonction pour télécharger le PDF depuis la modal
const handleDownloadFromModal = () => {
  if (pdfUrl) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `paiements-clients-${moment().format("YYYY-MM-DD")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Nettoyer l'URL du blob
useEffect(() => {
  return () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  };
}, [pdfUrl]);

  const fetchTrésorerieData = async () => {
    debugger
    try {
      setLoading(true);
      const start = moment(startDate).format('YYYY-MM-DD');
      const end = moment(endDate).format('YYYY-MM-DD');

      const response = await fetch(`${API_BASE}/getpayment/data?startDate=${start}&endDate=${end}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      
      const result = await response.json();
      
      if (result.success) {
        setData({
          ...result.data,
          paymentMethods: result.data.paymentMethods || {
            especes: 0, cheque: 0, virement: 0, traite: 0, autre: 0, retenue: 0
          },
          paymentMethodsBySource: result.data.paymentMethodsBySource || {
            bcPayments: { especes: 0, cheque: 0, virement: 0, traite: 0, autre: 0 },
            facturePayments: { especes: 0, cheque: 0, virement: 0, traite: 0, autre: 0 },
            ventePayments: { especes: 0, cheque: 0, virement: 0, traite: 0, autre: 0 }
          },
          transactions: result.data.transactions || [],
          counts: {
            ...result.data.counts,
            totalTransactions: (result.data.transactions || []).length
          }
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrésorerieData();
  }, []);


  const { userProfile, loading: profileLoading } = useProfile();

  
  const companyInfo = useMemo(
    () => ({
      name: userProfile?.company_name || "Votre Société",
      address: userProfile?.company_address || "Adresse",
      city: userProfile?.company_city || "Ville",
      phone: userProfile?.company_phone || "Téléphone",
      email: userProfile?.company_email || "Email",
      website: userProfile?.company_website || "Site web",
      taxId: userProfile?.company_tax_id || "MF",
      logo: logo,
      gsm: userProfile?.company_gsm,
    }),
    [userProfile]
  );

  // Calculate payment methods by source
  // Calculate payment methods by source
const calculatePaymentMethodsBySource = () => {
  const bcPayments = { especes: 0, cheque: 0, virement: 0, traite: 0, carte: 0, autre: 0, retenue: 0 };
  const facturePayments = { especes: 0, cheque: 0, virement: 0, traite: 0, carte: 0, autre: 0, retenue: 0 };
  const ventePayments = { especes: 0, cheque: 0, virement: 0, traite: 0, carte: 0, autre: 0, retenue: 0 };

  data.transactions.forEach(transaction => {
    const sourcePayments = 
      transaction.type === 'paiement_bc' || transaction.type === 'bon_commande' ? bcPayments :
      transaction.type === 'facture_direct' || transaction.type === 'encaissement' ? facturePayments :
      transaction.type === 'vente_comptoire' ? ventePayments : null;

    if (sourcePayments) {
      transaction.paymentMethods.forEach(payment => {
        let method = payment.method.toLowerCase();
        // Normalize TPE/Carte methods
        if (method.includes('tpe') || method.includes('carte') || method.includes('cb')) {
          method = 'carte';
        }
        const methodKey = method as keyof typeof sourcePayments;
        if (sourcePayments[methodKey] !== undefined) {
          sourcePayments[methodKey] += Number(payment.amount || 0);
        }
      });
    }
  });

  return { bcPayments, facturePayments, ventePayments };
};

  const { bcPayments, facturePayments, ventePayments } = calculatePaymentMethodsBySource();

  // Calculate totals by type for main cards
  const calculateTotals = () => {
    let totalEncaissementFacture = 0;
    let totalEncaissementBC = 0;
    let totalVentesComptoire = 0;

    data.transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'facture_direct':
        case 'encaissement':
          totalEncaissementFacture += transaction.montant;
          break;
        case 'paiement_bc':
        case 'bon_commande':
          totalEncaissementBC += transaction.montant;
          break;
        case 'vente_comptoire':
          totalVentesComptoire += transaction.montant;
          break;
      }
    });

    return {
      totalEncaissementFacture,
      totalEncaissementBC,
      totalVentesComptoire
    };
  };

  const { totalEncaissementFacture, totalEncaissementBC, totalVentesComptoire } = calculateTotals();

  const getTransactionTypeBadge = (type: string) => {
    const types = {
      facture_direct: { color: 'success', label: 'Facture Direct' },
      encaissement: { color: 'info', label: 'Encaissement' },
      paiement_bc: { color: 'primary', label: 'Paiement BC' },
      bon_commande: { color: 'warning', label: 'BC Direct' },
      vente_comptoire: { color: 'secondary', label: 'Vente Comptoire' }
    };
    const typeInfo = types[type as keyof typeof types] || { color: 'secondary', label: type };
    return <Badge color={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const getPaymentMethodBadge = (method: string) => {
    const methods = {
      especes: { color: 'success', label: 'Espèces' },
      cheque: { color: 'primary', label: 'Chèque' },
      virement: { color: 'info', label: 'Virement' },
      traite: { color: 'warning', label: 'Traite' },
      retenue: { color: 'danger', label: 'Retenue' },
      autre: { color: 'secondary', label: 'Autre' },
      carte: { color: 'info', label: 'Carte' },
      tpe: { color: 'info', label: 'TPE' },
      cb: { color: 'info', label: 'CB' }
    };
    const methodKey = method.toLowerCase() as keyof typeof methods;
    const methodInfo = methods[methodKey] || { color: 'secondary', label: method };
    return <Badge color={methodInfo.color} className="me-1">{methodInfo.label}</Badge>;
  };

  const widgetsData = [
    {
      label: "Encaissements Facture Client",
      counter: totalEncaissementFacture,
      suffix: " DT",
      decimals: 3,
      icon: "ri-file-text-line",
      cardColor: "success",
      badgeClass: "success",
      percentage: "+12.5",
      link: `${data.counts?.encaissements + data.counts?.factures || 0} Transactions`,
      description: "Factures directes + Encaissements"
    },
    {
      label: "Encaissements BC Client",
      counter: totalEncaissementBC,
      suffix: " DT",
      decimals: 3,
      icon: "ri-shopping-bag-line",
      cardColor: "primary",
      badgeClass: "success",
      percentage: "+8.3",
      link: `${data.counts?.paiementsBC + data.counts?.bonCommandes || 0} Transactions`,
      description: "BC directes + Paiements BC"
    },
    {
      label: "Ventes Comptoire",
      counter: totalVentesComptoire,
      suffix: " DT",
      decimals: 3,
      icon: "ri-store-2-line",
      cardColor: "info",
      badgeClass: "success",
      percentage: "+15.2",
      link: `${data.counts?.ventes || 0} Ventes`,
      description: "Ventes au comptoire"
    },
    {
      label: "Paiements Fournisseurs",
      counter: data.totalPaiementsFournisseurs,
      suffix: " DT",
      decimals: 3,
      icon: "ri-bank-line",
      cardColor: "warning",
      badgeClass: "danger",
      percentage: "+15.2",
      link: `${data.counts?.paiementsFournisseurs || 0} Paiements`,
      description: "Sorties de trésorerie"
    },
    {
      label: "Trésorerie Nette",
      counter: Math.abs(data.earnings),
      prefix: data.earnings >= 0 ? "" : "-",
      suffix: " DT",
      decimals: 3,
      icon: data.earnings >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line",
      cardColor: data.earnings >= 0 ? "dark" : "danger",
      badgeClass: data.earnings >= 0 ? "success" : "danger",
      percentage: data.earnings >= 0 ? "+5.7" : "-3.2",
      link: data.earnings >= 0 ? "Excédent" : "Déficit",
      description: "Solde net de trésorerie"
    }
  ];

  // Payment methods by source
// Payment methods by source
const paymentMethodsBySource = [
  {
    title: "BC Client",
    description: "Méthodes de paiement pour les BC (direct + paiements BC)",
    methods: [
      { label: "Espèces", value: bcPayments.especes, color: "success", icon: "ri-money-dollar-box-line" },
      { label: "Chèques", value: bcPayments.cheque, color: "primary", icon: "ri-bank-card-line" },
      { label: "Virements", value: bcPayments.virement, color: "info", icon: "ri-exchange-dollar-line" },
      { label: "Traites", value: bcPayments.traite, color: "warning", icon: "ri-file-text-line" },
      { label: "Cartes Bancaire TPE", value: bcPayments.carte, color: "info", icon: "ri-bank-card-2-line" },
    ]
  },
  {
    title: "Facture Client",
    description: "Méthodes de paiement pour les factures (direct + encaissements)",
    methods: [
      { label: "Espèces", value: facturePayments.especes, color: "success", icon: "ri-money-dollar-box-line" },
      { label: "Chèques", value: facturePayments.cheque, color: "primary", icon: "ri-bank-card-line" },
      { label: "Virements", value: facturePayments.virement, color: "info", icon: "ri-exchange-dollar-line" },
      { label: "Traites", value: facturePayments.traite, color: "warning", icon: "ri-file-text-line" },
      { label: "Cartes Bancaire TPE", value: facturePayments.carte, color: "info", icon: "ri-bank-card-2-line" },
    ]
  },
  {
    title: "Vente Comptoire",
    description: "Méthodes de paiement pour les ventes au comptoire",
    methods: [
      { label: "Espèces", value: ventePayments.especes, color: "success", icon: "ri-money-dollar-box-line" },
      { label: "Chèques", value: ventePayments.cheque, color: "primary", icon: "ri-bank-card-line" },
      { label: "Virements", value: ventePayments.virement, color: "info", icon: "ri-exchange-dollar-line" },
      { label: "Traites", value: ventePayments.traite, color: "warning", icon: "ri-file-text-line" },
      { label: "Cartes Bancaire TPE", value: ventePayments.carte, color: "info", icon: "ri-bank-card-2-line" },
    ]
  }
];

  return (
    <div className="page-content">
      <Container fluid>
        {/* Header Section */}
        <Row className="mb-2">
          <Col xs={12}>
            <div className="d-flex align-items-lg-center flex-lg-row flex-column">
              <div className="flex-grow-1">
                <h4 className="fs-16 mb-1">Tableau de Bord Trésorerie</h4>
                <p className="text-muted mb-0">Aperçu financier de votre entreprise.</p>
              </div>
              <div className="mt-2 mt-lg-0">
                <Row className="g-2 mb-0 align-items-center">
                  <div className="col-sm-auto">
                    <Label className="form-label mb-1">Date début</Label>
                    <Flatpickr className="form-control" value={[startDate]}
                      onChange={(dates: Date[]) => dates[0] && setStartDate(dates[0])}
                      options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }} />
                  </div>
                  <div className="col-sm-auto">
                    <Label className="form-label mb-1">Date fin</Label>
                    <Flatpickr className="form-control" value={[endDate]}
                      onChange={(dates: Date[]) => dates[0] && setEndDate(dates[0])}
                      options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }} />
                  </div>
                  <div className="col-sm-auto d-flex align-items-end">
                    <Button color="primary" className="w-100" onClick={fetchTrésorerieData} disabled={loading}>
                      {loading ? 'Chargement...' : 'Actualiser'}
                    </Button>
                  </div>
                </Row>
              </div>
            </div>
          </Col>
        </Row>


        <Row className="mb-3">
  <Col xs={12}>
    <div className="d-flex justify-content-end">
      <Button 
        color="success" 
        onClick={handleViewPdf} 
        disabled={generatingPdf || loading}
      >
        <i className="ri-file-pdf-line me-2"></i>
        {generatingPdf ? "Génération..." : "Voir PDF"}
      </Button>
    </div>
  </Col>
</Row>

        {/* Tabs Navigation */}
        <Row className="mb-3">
          <Col xs={12}>
            <div className="d-flex border-bottom">
              <Button
                color="light"
                className={`border-0 me-2 ${activeTab === 'overview' ? 'bg-primary text-white' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="ri-dashboard-line me-1"></i> Vue d'ensemble
              </Button>
              <Button
                color="light"
                className={`border-0 ${activeTab === 'transactions' ? 'bg-primary text-white' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                <i className="ri-list-check-2 me-1"></i> Transactions ({data.transactions.length})
              </Button>
            </div>
          </Col>
        </Row>

        {activeTab === 'overview' ? (
          <>
            {/* Main Widgets */}
            <Row className="mb-3">
              {widgetsData.map((item, key) => (
                <Col xl={3} md={6} key={key} className="mb-3">
                  <Card className={"card-animate bg-" + item.cardColor}>
                    <CardBody>
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 overflow-hidden">
                          <p className="text-uppercase fw-bold text-white-50 text-truncate mb-0">{item.label}</p>
                          <small className="text-white-50">{item.description}</small>
                        </div>
                        <div className="flex-shrink-0">
                          <h5 className={"fs-14 mb-0 text-" + item.badgeClass}>
                            <i className={"fs-13 align-middle " + (item.percentage.startsWith('+') ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")}></i> 
                            {item.percentage} %
                          </h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                        <div>
                          <h4 className="fs-22 fw-bold ff-secondary mb-2 text-white">
                            {loading ? "Chargement..." : (
                              <CountUp start={0} prefix={item.prefix} suffix={item.suffix} separator={","}
                                end={Math.abs(item.counter)} decimals={item.decimals} duration={2} />
                            )}
                          </h4>
                          <a href="#" className="text-decoration-underline text-white-50">{item.link}</a>
                        </div>
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title rounded fs-3 bg-white bg-opacity-10">
                            <i className={`text-white ${item.icon}`}></i>
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Payment Methods by Source */}
            <Row className="mb-3">
              {paymentMethodsBySource.map((source, index) => (
                <Col xl={4} md={6} key={index} className="mb-3">
                  <Card>
                    <CardBody>
                      <h5 className="card-title mb-3">{source.title}</h5>
                      <p className="text-muted mb-3 fs-12">{source.description}</p>
                      <div className="payment-methods-list">
                        {source.methods.map((method, methodIndex) => (
                          <div key={methodIndex} className="d-flex align-items-center justify-content-between mb-3 p-2 border rounded">
                            <div className="d-flex align-items-center">
                              <div className={`avatar-xs me-3 bg-${method.color}-subtle`}>
                                <i className={`fs-5 text-${method.color} ${method.icon}`}></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fs-14">{method.label}</h6>
                              </div>
                            </div>
                            <div className="text-end">
                              <h6 className="mb-0 text-primary fw-bold">
                                <CountUp 
                                  start={0} 
                                  suffix=" DT" 
                                  separator={","} 
                                  end={method.value} 
                                  decimals={3} 
                                  duration={2} 
                                />
                              </h6>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Retenue Information */}
            <Row>
              <Col xs={12}>
                <Card>
                  <CardBody className="p-3">
                    <h4 className="card-title mb-3">Informations Retenue</h4>
                    <div className="row text-center">
                      <div className="col-md-4">
                        <div className="border-end">
                          <h4 className="text-danger fw-bold">
                            <CountUp 
                              start={0} 
                              suffix=" DT" 
                              separator={","} 
                              end={data.paymentMethods?.retenue || 0} 
                              decimals={3} 
                              duration={2} 
                            />
                          </h4>
                          <p className="text-muted mb-0">Total Retenue</p>
                          <small className="text-muted">Montants retenus sur factures et BC</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="border-end">
                          <h4 className="text-warning fw-bold">
                            {data.transactions.filter(t => t.hasRetenue && t.montantRetenue).length}
                          </h4>
                          <p className="text-muted mb-0">Documents avec Retenue</p>
                          <small className="text-muted">Factures et BC avec retenue appliquée</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div>
                          <h4 className="text-info fw-bold">
                            {data.transactions.filter(t => t.paymentMethods.some(p => p.method === 'retenue')).length}
                          </h4>
                          <p className="text-muted mb-0">Paiements avec Retenue</p>
                          <small className="text-muted">Paiements incluant retenue comme méthode</small>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          /* Transactions Tab */
          <Row>
            <Col xs={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-3">Détail des Transactions</h4>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Numéro</th>
                          <th>Client</th>
                          <th>Source</th>
                          <th>Méthodes de Paiement</th>
                          <th className="text-end">Montant</th>
                          <th>Retenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              Aucune transaction trouvée pour la période sélectionnée
                            </td>
                          </tr>
                        ) : (
                          data.transactions.map((transaction, index) => (
                            <tr key={index}>
                              <td>{moment(transaction.date).format('DD/MM/YYYY')}</td>
                              <td>{getTransactionTypeBadge(transaction.type)}</td>
                              <td>
                                <strong>{transaction.numero}</strong>
                              </td>
                              <td>{transaction.client.name}</td>
                              <td>
                                <small className="text-muted">{transaction.source || 'Direct'}</small>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {transaction.paymentMethods.map((payment, pIndex) => (
                                    <div key={pIndex}>
                                      {getPaymentMethodBadge(payment.method)}
                                      {payment.tauxRetention && (
                                        <Badge color="light" className="ms-1">
                                          {payment.tauxRetention}%
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="text-end fw-bold">
                                <CountUp 
                                  start={0} 
                                  suffix=" DT" 
                                  separator={","} 
                                  end={transaction.montant} 
                                  decimals={3} 
                                  duration={1} 
                                />
                              </td>
                              <td>
                                {transaction.hasRetenue && transaction.montantRetenue ? (
                                  <Badge color="danger">
                                    Retenue: <CountUp 
                                      start={0} 
                                      suffix=" DT" 
                                      separator={","} 
                                      end={transaction.montantRetenue} 
                                      decimals={3} 
                                      duration={1} 
                                    />
                                  </Badge>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        <style>{`
          .payment-methods-list .border {
            border-color: #e9ecef !important;
            transition: all 0.2s ease;
          }
          
          .payment-methods-list .border:hover {
            border-color: #0d6efd !important;
            background-color: #f8f9fa;
          }
          
          .avatar-xs {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          }
          .pdf-viewer-modal .modal-content {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          }
          
          .pdf-viewer-modal .modal-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 1.25rem 1.5rem;
          }
          
          .pdf-viewer-modal .modal-body {
            padding: 0;
          }
          
          .modal-icon-wrapper {
            transition: all 0.3s ease;
          }
          
          .modal-icon-wrapper:hover {
            transform: scale(1.05);
          }

        `}</style>

<Modal
  isOpen={pdfModal}
  toggle={() => setPdfModal(false)}
  centered
  size="xl"
  className="pdf-viewer-modal"
  style={{ maxWidth: '90%', maxHeight: '90vh' }}
>
  <ModalHeader toggle={() => setPdfModal(false)} className="border-0">
    <div className="d-flex align-items-center">
      <div className="modal-icon-wrapper bg-danger bg-opacity-10 rounded-circle p-2 me-3">
        <i className="ri-file-pdf-line text-danger fs-4"></i>
      </div>
      <div>
        <h4 className="mb-0 fw-bold text-dark">Rapport des Paiements Clients</h4>
        <small className="text-muted">
          Période du {moment(startDate).format("DD/MM/YYYY")} au {moment(endDate).format("DD/MM/YYYY")}
        </small>
      </div>
    </div>
  </ModalHeader>
  
  <ModalBody className="p-0 d-flex flex-column" style={{ minHeight: '600px' }}>
    {pdfUrl ? (
      <>
        {/* Barre d'outils */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
          <div>
        
          </div>
          <div className="d-flex gap-2">
            <Button
              color="light"
              size="sm"
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.contentWindow?.print();
                }
              }}
              title="Imprimer"
              className="d-flex align-items-center"
            >
              <i className="ri-printer-line me-1"></i> Imprimer
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={handleDownloadFromModal}
              title="Télécharger"
              className="d-flex align-items-center"
            >
              <i className="ri-download-line me-1"></i> Télécharger
            </Button>
          </div>
        </div>
        
        {/* Iframe pour afficher le PDF */}
        <div className="flex-grow-1" style={{ minHeight: '500px' }}>
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            title="Rapport des Paiements Clients"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              minHeight: '500px'
            }}
          />
        </div>
        
        {/* Note informative */}
        <div className="p-3 border-top bg-light">
          <small className="text-muted">
            <i className="ri-information-line me-1"></i>
            Cliquez sur "Télécharger" pour enregistrer le PDF ou "Imprimer" pour l'imprimer directement.
          </small>
        </div>
      </>
    ) : (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement du PDF...</span>
        </div>
        <p className="mt-3 text-muted">Chargement du PDF...</p>
      </div>
    )}
  </ModalBody>
</Modal>
      </Container>

      
    </div>
  );
};

export default Trésorerie;