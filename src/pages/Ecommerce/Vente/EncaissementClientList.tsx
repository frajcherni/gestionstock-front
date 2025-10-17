import React, { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import {
  Card, CardBody, Col, Container, CardHeader, Row, Modal, ModalHeader, Form, ModalBody, ModalFooter, Label, Input, FormFeedback,
  Badge, Button, InputGroupText, InputGroup
} from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import {
  fetchEncaissementsClient, createEncaissementClient, updateEncaissementClient, deleteEncaissementClient,
  fetchFacturesClient, fetchNextEncaissementNumberFromAPI
} from "./FactureClientServices";
import { fetchClients } from "../../../Components/Article/ArticleServices";
import { Client, FactureClient, EncaissementClient } from "../../../Components/Article/Interfaces";

const EncaissementClientList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const factureIdFromUrl = queryParams.get('factureId');

  const [createEditModal, setCreateEditModal] = useState(false);
  const [encaissement, setEncaissement] = useState<EncaissementClient | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [encaissements, setEncaissements] = useState<EncaissementClient[]>([]);
  const [filteredEncaissements, setFilteredEncaissements] = useState<EncaissementClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [factures, setFactures] = useState<FactureClient[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchText, setSearchText] = useState("");
  const [nextEncaissementNumber, setNextEncaissementNumber] = useState("ENC-C202500001");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedFactureId, setSelectedFactureId] = useState<number | null>(factureIdFromUrl ? Number(factureIdFromUrl) : null);

  // Helper function to calculate final total for a facture (same logic as in facture client)
  const getFactureFinalTotal = useCallback((facture: FactureClient): number => {
    // Use totalTTCAfterRemise if available (from your facture calculation)

    
    // Otherwise calculate it using the same logic
    let grandTotal = Number(facture.totalTTC) || 0;
    const hasDiscount = facture.remise && Number(facture.remise) > 0;
    let finalTotal = grandTotal;
    
    // Apply discount
    if (hasDiscount) {
      if (facture.remiseType === "percentage") {
        finalTotal = grandTotal * (1 - Number(facture.remise) / 100);
      } else {
        finalTotal = Number(facture.remise);
      }
    }
    
    // Apply timbre fiscal
    if (facture.timbreFiscal) {
      if (hasDiscount) {
        // If there's a discount, add timbre to final total (after discount)
        finalTotal += 1;
      } else {
        // If no discount, add timbre to grand total
        finalTotal = grandTotal + 1;
      }
    }
    
    // Fix floating point precision
    return Math.round(finalTotal * 100) / 100;
  }, []);

  useEffect(() => {
    if (clientSearch.length >= 3) {
      const filtered = clients.filter(client =>
        client.raison_sociale.toLowerCase().includes(clientSearch.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [clientSearch, clients]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [encaissementsData, clientsData, facturesData] = await Promise.all([
        fetchEncaissementsClient(),
        fetchClients(),
        fetchFacturesClient(),
      ]);

      setEncaissements(encaissementsData);
      setFilteredEncaissements(encaissementsData);
      setClients(clientsData);
      setFactures(facturesData);

      if (factureIdFromUrl) {
        const facture = facturesData.find(f => f.id === Number(factureIdFromUrl));
        if (facture) {
          setSelectedFactureId(facture.id);
          const client = clientsData.find(c => c.id === facture.client_id);
          if (client) {
            setSelectedClient(client);
          }
        }
      }

      const nextNumber = await fetchNextEncaissementNumberFromAPI();
      setNextEncaissementNumber(nextNumber);

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du chargement des données");
      setLoading(false);
    }
  }, [factureIdFromUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let result = [...encaissements];

    if (startDate && endDate) {
      const start = moment(startDate).startOf('day');
      const end = moment(endDate).endOf('day');
      result = result.filter(encaissement => {
        const encaissementDate = moment(encaissement.date);
        return encaissementDate.isBetween(start, end, null, '[]');
      });
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(encaissement =>
        encaissement.numeroEncaissement.toLowerCase().includes(searchLower) ||
        (getClientName(encaissement) && getClientName(encaissement).toLowerCase().includes(searchLower)) ||
        (getFactureNumber(encaissement) && getFactureNumber(encaissement).toLowerCase().includes(searchLower))
      );
    }

    setFilteredEncaissements(result);
  }, [startDate, endDate, searchText, encaissements, clients]);

  const getClientName = (encaissement: EncaissementClient) => {
    if (encaissement.client?.raison_sociale) {
      return encaissement.client.raison_sociale;
    }
    if (encaissement.factureClient?.client) {
      const client = clients.find(c => c.id === encaissement.factureClient.client.id);
      return client ? client.raison_sociale : 'N/A';
    }
    return 'N/A';
  };

  const getFactureNumber = (encaissement: EncaissementClient) => {
    if (encaissement.factureClient?.numeroFacture) {
      return encaissement.factureClient.numeroFacture;
    }
    return 'N/A';
  };

  const toggleCreateEditModal = useCallback(() => {
    if (createEditModal) {
      setCreateEditModal(false);
      setEncaissement(null);
      setSelectedClient(null);
      setClientSearch("");
      setSelectedFactureId(factureIdFromUrl ? Number(factureIdFromUrl) : null);
      validation.resetForm();
    } else {
      setCreateEditModal(true);
      // Only set client values for new encaissements
      if (!isEdit) {
        validation.setValues({
          montant: 0,
          modePaiement: "Espece",
          numeroEncaissement: nextEncaissementNumber,
          date: moment().format("YYYY-MM-DD"),
          client_id: selectedClient?.id || 0,
        });
      }
    }
  }, [createEditModal, nextEncaissementNumber, selectedClient, factureIdFromUrl, isEdit]);

  const calculateMaxAllowedAmount = useCallback(() => {
    if (!isEdit || !encaissement?.factureClient) return { amount: 0, factureNumber: '', finalTotal: 0 };

    const facture = encaissement.factureClient;
    
    // Use the final total after discount and timbre fiscal
    const finalTotal = getFactureFinalTotal(facture);

    // Calculate total payments excluding the current encaissement being edited
    const otherPayments = encaissements
      .filter(e => e.facture_id === facture.id && e.id !== encaissement.id)
      .reduce((sum, e) => sum + Number(e.montant), 0);

    const maxAllowed = finalTotal - otherPayments;
    
    console.log("Payment calculation:", {
      finalTotal,
      otherPayments,
      maxAllowed,
      factureNumber: facture.numeroFacture
    });

    return {
      amount: Math.max(0, maxAllowed),
      factureNumber: facture.numeroFacture,
      finalTotal: finalTotal
    };
  }, [isEdit, encaissement, encaissements, getFactureFinalTotal]);

  const handleSubmit = async (values: any) => {
    try {
      // CRITICAL FIX: Get client_id from the facture if not directly available
      let clientId = null;
      
      if (isEdit) {
        // For edits: Use existing client_id OR get from facture
        clientId = encaissement?.client_id;
        if (!clientId && encaissement?.factureClient?.client) {
          clientId = encaissement.factureClient.client.id;
        }
      } else {
        // For creates: Use selected client OR get from selected facture
        if (selectedClient) {
          clientId = selectedClient.id;
        } else if (selectedFactureId) {
          const selectedFacture = factures.find(f => f.id === selectedFactureId);
          clientId = selectedFacture?.client_id;
        }
      }
  
      console.log("DEBUG - Determined clientId:", clientId);
  
      const encaissementData: Partial<EncaissementClient> = {
        montant: Number(values.montant),
        modePaiement: values.modePaiement,
        numeroEncaissement: values.numeroEncaissement,
        date: values.date,
        facture_id: isEdit ? encaissement?.facture_id : (selectedFactureId || 0),
        client_id: clientId || 0
      };
  
      console.log("DEBUG - Final encaissement data:", encaissementData);
  
      if (isEdit && encaissement) {
        await updateEncaissementClient(encaissement.id, encaissementData);
        toast.success("Encaissement mis à jour avec succès");
      } else {
        await createEncaissementClient(encaissementData);
        toast.success("Encaissement créé avec succès");
      }
  
      setCreateEditModal(false);
      setSelectedFactureId(factureIdFromUrl ? Number(factureIdFromUrl) : null);
      fetchData();
    } catch (err) {
      console.error("DEBUG - Error in handleSubmit:", err);
      toast.error(err instanceof Error ? err.message : "Échec de l'opération");
    }
  };
  

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      montant: encaissement?.montant || 0,
      modePaiement: encaissement?.modePaiement || "Espece",
      numeroEncaissement: encaissement?.numeroEncaissement || nextEncaissementNumber,
      date: encaissement?.date ? moment(encaissement.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
      client_id: isEdit ? (encaissement?.client_id || 0) : (selectedClient?.id || 0),
    },
    validationSchema: Yup.object().shape({
      montant: Yup.number()
        .min(0.01, "Le montant doit être supérieur à 0")
        .test('max-amount', function (value) {
          if (!isEdit || !encaissement?.factureClient) return true;

          const { amount: maxAllowed } = calculateMaxAllowedAmount();
          const currentMontant = Number(value) || 0;

          if (currentMontant > maxAllowed) {
            return this.createError({
              message: `Le montant ne peut pas dépasser ${maxAllowed.toFixed(2)} DT (reste à payer)`
            });
          }

          return true;
        })
        .required("Le montant est requis"),
      modePaiement: Yup.string().required("Le mode de paiement est requis"),
      numeroEncaissement: Yup.string().required("Le numéro d'encaissement est requis"),
      date: Yup.date().required("La date est requise"),
    }),
    onSubmit: handleSubmit,
  });

  const handleDelete = async () => {
    if (!encaissement) return;

    try {
      await deleteEncaissementClient(encaissement.id);
      setDeleteModal(false);
      fetchData();
      toast.success("Encaissement supprimé avec succès");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la suppression");
    }
  };

  const ModePaiementBadge = ({ mode }: { mode?: string }) => {
    const modeConfig = {
      "Espece": { bgClass: "bg-success", textClass: "text-success", icon: "ri-money-dollar-circle-line" },
      "Cheque": { bgClass: "bg-info", textClass: "text-info", icon: "ri-bank-card-line" },
      "Virement": { bgClass: "bg-primary", textClass: "text-primary", icon: "ri-exchange-funds-line" },
      "Traite": { bgClass: "bg-warning", textClass: "text-warning", icon: "ri-file-text-line" },
      "Autre": { bgClass: "bg-secondary", textClass: "text-secondary", icon: "ri-more-line" },
    };

    if (!mode) return null;

    const config = modeConfig[mode as keyof typeof modeConfig] || modeConfig["Autre"];

    return (
      <span className={`badge ${config.bgClass}-subtle ${config.textClass} text-uppercase`}>
        <i className={`${config.icon} align-bottom me-1`}></i>
        {mode}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      {
        header: "Numéro d'Encaissement",
        accessorKey: "numeroEncaissement",
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue(),
      },
      {
        header: "Client",
        accessorKey: "client",
        enableColumnFilter: false,
        cell: (cell: any) => getClientName(cell.row.original),
      },
      {
        header: "Facture",
        accessorKey: "factureClient",
        enableColumnFilter: false,
        cell: (cell: any) => getFactureNumber(cell.row.original),
      },
      {
        header: "Montant",
        accessorKey: "montant",
        enableColumnFilter: false,
        cell: (cell: any) => `${parseFloat(cell.getValue()).toFixed(2)} DT`,
      },
      {
        header: "Mode de Paiement",
        accessorKey: "modePaiement",
        enableColumnFilter: false,
        cell: (cell: any) => <ModePaiementBadge mode={cell.getValue()} />,
      },
      {
        header: "Date",
        accessorKey: "date",
        enableColumnFilter: false,
        cell: (cell: any) => moment(cell.getValue()).format("DD MMM YYYY"),
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const encaissement = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit">
                <Link
                  to="#"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => {
                    setEncaissement(encaissement);
                    // Don't set selectedClient for edit mode - we'll use the existing client_id
                    setSelectedFactureId(encaissement.facture_id || null);
                    validation.setFieldValue("client_id", encaissement.client_id || 0);
                    setIsEdit(true);
                    setCreateEditModal(true);
                  }}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block"
                  onClick={() => {
                    setEncaissement(encaissement);
                    setDeleteModal(true);
                  }}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li>
            </ul>
          );
        },
      },
    ],
    [clients]
  );

  return (
    <div className="page-content">
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <BreadCrumb title="Encaissements Clients" pageTitle="Encaissements" />

        <Row>
          <Col lg={12}>
            <Card id="encaissementList">
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="card-title mb-0">Gestion des Encaissements Clients</h5>
                  </div>
                  <div className="col-sm-auto">
                    <div className="d-flex gap-1 flex-wrap">
                      <Button
                        color="secondary"
                        onClick={() => {
                          setIsEdit(false);
                          setEncaissement(null);
                          setSelectedClient(null);
                          setClientSearch("");
                          setSelectedFactureId(factureIdFromUrl ? Number(factureIdFromUrl) : null);
                          validation.resetForm();
                          setCreateEditModal(true);
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i> Ajouter Encaissement
                      </Button>
                    </div>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="pt-3">
                <Row className="mb-3">
                  <Col md={4}>
                    <div className="search-box">
                      <Input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      <i className="ri-search-line search-icon"></i>
                    </div>
                  </Col>
                  <Col md={3}>
                    <InputGroup>
                      <InputGroupText>De</InputGroupText>
                      <Flatpickr
                        className="form-control"
                        options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }}
                        placeholder="Date de début"
                        onChange={(dates) => setStartDate(dates[0])}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <InputGroup>
                      <InputGroupText>À</InputGroupText>
                      <Flatpickr
                        className="form-control"
                        options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }}
                        placeholder="Date de fin"
                        onChange={(dates) => setEndDate(dates[0])}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2}>
                    <Button
                      color="light"
                      className="w-100"
                      onClick={() => {
                        setStartDate(null);
                        setEndDate(null);
                        setSearchText("");
                      }}
                    >
                      <i className="ri-close-line align-bottom me-1"></i> Réinitialiser
                    </Button>
                  </Col>
                </Row>

                {loading ? (
                  <Loader />
                ) : error ? (
                  <div className="text-danger">{error}</div>
                ) : (
                  <TableContainer
                    columns={columns}
                    data={filteredEncaissements}
                    isGlobalFilter={false}
                    customPageSize={10}
                    divClass="table-responsive table-card mb-1 mt-0"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light text-muted text-uppercase"
                  />
                )}

                <Modal isOpen={createEditModal} toggle={toggleCreateEditModal} centered size="lg">
                  <ModalHeader toggle={toggleCreateEditModal}>
                    {isEdit ? "Modifier Encaissement" : "Créer Encaissement"}
                  </ModalHeader>
                  <Form onSubmit={validation.handleSubmit}>
                    <ModalBody style={{ padding: '20px' }}>
                      {!isEdit && (
                        <Row>
                          <Col md={12}>
                            <div className="mb-3">
                              <Label>Client*</Label>
                              <Input
                                type="text"
                                placeholder="Rechercher client (min 3 caractères)"
                                value={selectedClient ? selectedClient.raison_sociale : clientSearch}
                                onChange={(e) => {
                                  if (!e.target.value) {
                                    setSelectedClient(null);
                                    validation.setFieldValue("client_id", 0);
                                  }
                                  setClientSearch(e.target.value);
                                }}
                                readOnly={!!selectedClient}
                              />
                              {!selectedClient && clientSearch.length >= 3 && (
                                <div className="search-results mt-2">
                                  {filteredClients.length > 0 ? (
                                    <ul className="list-group">
                                      {filteredClients.map(c => (
                                        <li
                                          key={c.id}
                                          className="list-group-item list-group-item-action"
                                          onClick={() => {
                                            setSelectedClient(c);
                                            validation.setFieldValue("client_id", c.id);
                                          }}
                                        >
                                          {c.raison_sociale}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="text-muted">Aucun résultat trouvé</div>
                                  )}
                                </div>
                              )}
                              {selectedClient && (
                                <Button
                                  color="link"
                                  size="sm"
                                  className="mt-1 p-0"
                                  onClick={() => {
                                    setSelectedClient(null);
                                    setClientSearch("");
                                    validation.setFieldValue("client_id", 0);
                                  }}
                                >
                                  <i className="ri-close-line"></i> Changer de client
                                </Button>
                              )}
                              {validation.touched.client_id && validation.errors.client_id && (
                                <div className="text-danger">{validation.errors.client_id as string}</div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      )}

                      {isEdit && encaissement?.factureClient && (
                        <Row>
                          <Col md={12}>
                            <Card className="border border-warning">
                              <CardBody className="p-3">
                                <h6 className="text-warning mb-2">
                                  <i className="ri-information-line me-2"></i>
                                  Informations de paiement - Facture {encaissement.factureClient.numeroFacture}
                                </h6>
                                <div className="row">
                               
                           
                                  <div className="col-6">
                                    <small className="text-muted">Total Final:</small>
                                    <p className="mb-1 fw-bold text-primary">
                                      {calculateMaxAllowedAmount().finalTotal.toFixed(2)} DT
                                    </p>
                                  </div>
                                  <div className="col-6">
                                    <small className="text-muted">Autres paiements:</small>
                                    <p className="mb-1 fw-medium">
                                      {encaissements
                                        .filter(e => e.facture_id === encaissement.facture_id && e.id !== encaissement.id)
                                        .reduce((sum, e) => sum + Number(e.montant), 0)
                                        .toFixed(2)} DT
                                    </p>
                                  </div>
                                  <div className="col-6">
                                    <small className="text-muted">Paiement actuel:</small>
                                    <p className="mb-1 fw-medium">{Number(validation.values.montant).toFixed(2)} DT</p>
                                  </div>
                                  <div className="col-6">
                                    <small className="text-muted">Reste à payer:</small>
                                    <p className="mb-1 fw-medium text-success">
                                      {(
                                        calculateMaxAllowedAmount().finalTotal -
                                        encaissements
                                          .filter(e => e.facture_id === encaissement.facture_id && e.id !== encaissement.id)
                                          .reduce((sum, e) => sum + Number(e.montant), 0) -
                                        Number(validation.values.montant)
                                      ).toFixed(2)} DT
                                    </p>
                                  </div>
                                  <div className="col-12 mt-2">
                                    <div className="alert alert-info py-2 mb-0">
                                      <small>
                                        <i className="ri-lightbulb-line me-1"></i>
                                        <strong>Limite de paiement:</strong> Vous pouvez modifier ce paiement jusqu'à {calculateMaxAllowedAmount().amount.toFixed(2)} DT maximum
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      )}

                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label>Montant*</Label>
                            <Input
                              type="number"
                              name="montant"
                              value={validation.values.montant}
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={validation.touched.montant && !!validation.errors.montant}
                              step="0.01"
                              min="0.01"
                              max={isEdit && encaissement?.factureClient ? calculateMaxAllowedAmount().amount : undefined}
                            />
                            {validation.touched.montant && validation.errors.montant && (
                              <div className="text-danger">{validation.errors.montant as string}</div>
                            )}
                            {isEdit && encaissement?.factureClient && (
                              <small className="text-muted">
                                Maximum autorisé: {calculateMaxAllowedAmount().amount.toFixed(2)} DT
                                (reste à payer pour la facture {calculateMaxAllowedAmount().factureNumber})
                                {Number(validation.values.montant) > calculateMaxAllowedAmount().amount && (
                                  <span className="text-danger ms-2">
                                    <i className="ri-alert-line me-1"></i>
                                    Le montant dépasse la limite autorisée
                                  </span>
                                )}
                              </small>
                            )}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label>Mode de paiement*</Label>
                            <Input
                              type="select"
                              name="modePaiement"
                              value={validation.values.modePaiement}
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={validation.touched.modePaiement && !!validation.errors.modePaiement}
                            >
                              <option value="Espece">En espèces</option>
                              <option value="Cheque">Chèque</option>
                              <option value="Virement">Virement</option>
                              <option value="Traite">Traite</option>
                              <option value="Autre">Autre</option>
                            </Input>
                            {validation.touched.modePaiement && validation.errors.modePaiement && (
                              <div className="text-danger">{validation.errors.modePaiement as string}</div>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label>Numéro d'encaissement*</Label>
                            <Input
                              type="text"
                              name="numeroEncaissement"
                              value={validation.values.numeroEncaissement}
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={validation.touched.numeroEncaissement && !!validation.errors.numeroEncaissement}
                            />
                            {validation.touched.numeroEncaissement && validation.errors.numeroEncaissement && (
                              <div className="text-danger">{validation.errors.numeroEncaissement as string}</div>
                            )}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label>Date*</Label>
                            <Input
                              type="date"
                              name="date"
                              value={validation.values.date}
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={validation.touched.date && !!validation.errors.date}
                            />
                            {validation.touched.date && validation.errors.date && (
                              <div className="text-danger">{validation.errors.date as string}</div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="light" onClick={toggleCreateEditModal}>
                        <i className="ri-close-line align-bottom me-1"></i> Annuler
                      </Button>
                      <Button
                        color="primary"
                        type="submit"
                        disabled={!isEdit && !selectedClient}
                      >
                        <i className="ri-save-line align-bottom me-1"></i> {isEdit ? "Modifier" : "Enregistrer"}
                      </Button>
                    </ModalFooter>
                  </Form>
                </Modal>

                <ToastContainer />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EncaissementClientList;