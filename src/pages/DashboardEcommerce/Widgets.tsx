import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row, Container, Input, Label, Button } from 'reactstrap';
import CountUp from "react-countup";
import Flatpickr from "react-flatpickr";
import moment from "moment";

const API_BASE = "http://54.37.159.225:5000/api";

interface TrésorerieData {
  totalVentes: number;
  totalPaiementsClients: number;
  totalPaiementsFournisseurs: number;
  earnings: number;
}

const Trésorerie: React.FC = () => {
  const [data, setData] = useState<TrésorerieData>({
    totalVentes: 0,
    totalPaiementsClients: 0,
    totalPaiementsFournisseurs: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(moment().startOf('month').toDate());
  const [endDate, setEndDate] = useState<Date>(moment().endOf('month').toDate());

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
        setData(result.data);
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
      prefix: "",
      suffix: " DT",
      decimals: 3,
      icon: "ri-shopping-bag-line",
      cardColor: "primary",
      badgeClass: "success",
      percentage: "+",
      link: "Voir détails"
    },
    {
      label: "Encaissements Clients",
      counter: data.totalPaiementsClients,
      prefix: "",
      suffix: " DT",
      decimals: 3,
      icon: "ri-money-dollar-circle-line",
      cardColor: "success",
      badgeClass: "success",
      percentage: "+",
      link: "Voir détails"
    },
    {
      label: "Paiements Fournisseurs",
      counter: data.totalPaiementsFournisseurs,
      prefix: "",
      suffix: " DT",
      decimals: 3,
      icon: "ri-bank-line",
      cardColor: "warning",
      badgeClass: "danger",
      percentage: "+",
      link: "Voir détails"
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
      percentage: data.earnings >= 0 ? "+" : "-",
      link: data.earnings >= 0 ? "Excédent" : "Déficit"
    }
  ];

  return (
    <div className="page-content">
      <Container fluid>
        
        {/* Date Filter Section */}
        <Row className="mb-3 pb-1">
          <Col xs={12}>
            <div className="d-flex align-items-lg-center flex-lg-row flex-column">
              <div className="flex-grow-1">
                <h4 className="fs-16 mb-1">Tableau de Bord Trésorerie</h4>
                <p className="text-muted mb-0">Aperçu financier de votre entreprise.</p>
              </div>
              <div className="mt-3 mt-lg-0">
                <Row className="g-3 mb-0 align-items-center">
                  <div className="col-sm-auto">
                    <Label className="form-label">Date début</Label>
                    <Flatpickr
                      className="form-control"
                      value={[startDate]}
                      onChange={(dates: Date[]) => {
                        if (dates[0]) setStartDate(dates[0]);
                      }}
                      options={{
                        dateFormat: "d M, Y",
                        altInput: true,
                        altFormat: "F j, Y"
                      }}
                    />
                  </div>
                  <div className="col-sm-auto">
                    <Label className="form-label">Date fin</Label>
                    <Flatpickr
                      className="form-control"
                      value={[endDate]}
                      onChange={(dates: Date[]) => {
                        if (dates[0]) setEndDate(dates[0]);
                      }}
                      options={{
                        dateFormat: "d M, Y",
                        altInput: true,
                        altFormat: "F j, Y"
                      }}
                    />
                  </div>
                  <div className="col-sm-auto d-flex align-items-end">
                    <Button 
                      color="primary" 
                      className="w-100"
                      onClick={fetchTrésorerieData}
                      disabled={loading}
                    >
                      {loading ? 'Chargement...' : 'Actualiser'}
                    </Button>
                  </div>
                </Row>
              </div>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row>
          {widgetsData.map((item, key) => (
            <Col xl={3} md={6} key={key}>
              <Card className={"card-animate bg-" + item.cardColor}>
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-bold text-white-50 text-truncate mb-0">{item.label}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <h5 className={"fs-14 mb-0 text-" + item.badgeClass}>
                        <i className={"fs-13 align-middle " + (data.earnings >= 0 ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")}></i> 
                        {item.percentage} %
                      </h5>
                    </div>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-4">
                    <div>
                      <h4 className="fs-22 fw-bold ff-secondary mb-4 text-white">
                        <span className="counter-value">
                          {loading ? (
                            "Chargement..."
                          ) : (
                            <CountUp
                              start={0}
                              prefix={item.prefix}
                              suffix={item.suffix}
                              separator={","}
                              end={Math.abs(item.counter)}
                              decimals={item.decimals}
                              duration={2}
                            />
                          )}
                        </span>
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
      </Container>
    </div>
  );
};

export default Trésorerie;