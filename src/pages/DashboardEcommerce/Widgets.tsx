import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row, Container, Label, Button, Table } from 'reactstrap';
import CountUp from "react-countup";
import Flatpickr from "react-flatpickr";
import moment from "moment";

const API_BASE = process.env.REACT_APP_API_BASE;

interface TrésorerieData {
  totalVentes: number;
  totalPaiementsClients: number;
  totalPaiementsFournisseurs: number;
  earnings: number;
  paymentMethods?: {
    espece: number;
    cheque: number;
    virement: number;
    traite: number;
    autre: number;
  };
  topProducts?: Array<{
    id: number;
    reference: string;
    nom: string;
    marque: string;
    quantite: number;
    caTTC: number;
  }>;
  counts?: {
    ventes: number;
    encaissements: number;
    paiementsFournisseurs: number;
  };
}

const Trésorerie: React.FC = () => {
  const [data, setData] = useState<TrésorerieData>({
    totalVentes: 0,
    totalPaiementsClients: 0,
    totalPaiementsFournisseurs: 0,
    earnings: 0,
    paymentMethods: {
      espece: 0,
      cheque: 0,
      virement: 0,
      traite: 0,
      autre: 0
    },
    topProducts: [],
    counts: {
      ventes: 0,
      encaissements: 0,
      paiementsFournisseurs: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(moment().startOf('month').toDate());
  const [endDate, setEndDate] = useState<Date>(moment().endOf('month').toDate());

  const fetchTrésorerieData = async () => {
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
            espece: 0, cheque: 0, virement: 0, traite: 0, autre: 0
          },
          topProducts: result.data.topProducts || [],
          counts: result.data.counts || {
            ventes: 0, encaissements: 0, paiementsFournisseurs: 0
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

  const widgetsData = [
    {
      label: "Total Ventes",
      counter: data.totalVentes,
      suffix: " DT",
      decimals: 3,
      icon: "ri-shopping-bag-line",
      cardColor: "primary",
      badgeClass: "success",
      percentage: "+12.5",
      link: `${data.counts?.ventes || 0} Commandes`
    },
    {
      label: "Encaissements Clients",
      counter: data.totalPaiementsClients,
      suffix: " DT",
      decimals: 3,
      icon: "ri-money-dollar-circle-line",
      cardColor: "success",
      badgeClass: "success",
      percentage: "+8.3",
      link: `${data.counts?.encaissements || 0} Paiements`
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
      link: `${data.counts?.paiementsFournisseurs || 0} Paiements`
    },
    {
      label: "Trésorerie Nette",
      counter: Math.abs(data.earnings),
      prefix: data.earnings >= 0 ? "" : "-",
      suffix: " DT",
      decimals: 3,
      icon: data.earnings >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line",
      cardColor: data.earnings >= 0 ? "info" : "danger",
      badgeClass: data.earnings >= 0 ? "success" : "danger",
      percentage: data.earnings >= 0 ? "+5.7" : "-3.2",
      link: data.earnings >= 0 ? "Excédent" : "Déficit"
    }
  ];

  const paymentMethodData = [
    { 
      label: "Espèces", 
      counter: data.paymentMethods?.espece || 0, 
      icon: "ri-money-dollar-box-line", 
      color: "success",
      description: "Paiements en espèces"
    },
    { 
      label: "Chèques", 
      counter: data.paymentMethods?.cheque || 0, 
      icon: "ri-bank-card-line", 
      color: "primary",
      description: "Paiements par chèque"
    },
    { 
      label: "Virements", 
      counter: data.paymentMethods?.virement || 0, 
      icon: "ri-exchange-dollar-line", 
      color: "info",
      description: "Paiements par virement"
    },
    { 
      label: "Traites", 
      counter: data.paymentMethods?.traite || 0, 
      icon: "ri-file-text-line", 
      color: "warning",
      description: "Paiements par traite"
    },
    { 
      label: "Autres", 
      counter: data.paymentMethods?.autre || 0, 
      icon: "ri-more-line", 
      color: "secondary",
      description: "Autres modes de paiement"
    }
  ].map(method => ({
    ...method,
    percentage: data.totalPaiementsClients > 0 ? 
      ((method.counter / data.totalPaiementsClients) * 100).toFixed(1) : "0.0"
  }));

  return (
    <div className="page-content">
      <Container fluid>
        {/* Header Section - Moved Up */}
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

        {/* Main Widgets - Moved Closer to Header */}
        <Row className="mb-3">
          {widgetsData.map((item, key) => (
            <Col xl={3} md={6} key={key} className="mb-3">
              <Card className={"card-animate bg-" + item.cardColor}>
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-bold text-white-50 text-truncate mb-0">{item.label}</p>
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
                      <h4 className="fs-22 fw-bold ff-secondary mb-4 text-white">
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

        {/* Payment Methods Section - Moved Up */}
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody className="p-3">
                <h4 className="card-title mb-3">Répartition des Modes de Paiement</h4>
                <div className="payment-methods-grid">
                  {paymentMethodData.map((method, index) => (
                    <Card key={index} className="payment-method-card border-0 shadow-sm">
                      <CardBody className="text-center p-3">
                        {/* Icon without background color */}
                        <div className="payment-icon mb-3">
                          <i className={`fs-2 text-${method.color} ${method.icon}`}></i>
                        </div>
                        <h5 className="fs-14 mb-2 fw-semibold">{method.label}</h5>
                        <p className="text-muted mb-2 fs-12">{method.description}</p>
                        <h4 className="text-primary mb-2 fw-bold">
                          <CountUp 
                            start={0} 
                            suffix=" DT" 
                            separator={","} 
                            end={method.counter} 
                            decimals={3} 
                            duration={2} 
                          />
                        </h4>
                        <div className="progress mt-3" style={{ height: '6px' }}>
                          <div 
                            className={`progress-bar bg-${method.color}`}
                            role="progressbar" 
                            style={{ width: `${method.percentage}%` }}
                            aria-valuenow={parseFloat(method.percentage)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                        <span className="text-muted fs-11 mt-2 d-block">
                          {method.percentage}% du total
                        </span>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <style>{`
          .payment-methods-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
          }
          
          .payment-method-card {
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            border-radius: 12px;
            
          }
          
          .payment-method-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
          }
          
          .payment-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
          }
          
          .payment-icon i {
            font-size: 1.8rem !important;
          }
          
          @media (max-width: 768px) {
            .payment-methods-grid {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 0.75rem;
            }
            
            .payment-icon {
              width: 45px;
              height: 45px;
            }
            
            .payment-icon i {
              font-size: 1.5rem !important;
            }
          }
          
          @media (max-width: 576px) {
            .payment-methods-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.5rem;
            }
          }
        `}</style>
      </Container>
    </div>
  );
};

export default Trésorerie;