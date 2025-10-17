import React, { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import {
    Card, CardBody, Col, Container, CardHeader, Row, Modal, ModalHeader, Nav,
    NavItem, NavLink, Form, ModalBody, ModalFooter, Label, Input, FormFeedback, Badge, Table, Button, InputGroupText, InputGroup, FormGroup
} from "reactstrap";
import { Link } from "react-router-dom";
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
    fetchVenteComptoire, CreateVenteComptoire, updateventecomptoire, deleteventecomptoire, fetchNextVenteComptoireNumber
} from "../../../Components/CommandeClient/CommandeClientServices";
import { fetchArticles, fetchClients, fetchVendeurs } from "../../../Components/Article/ArticleServices";
import { Article, Client, Vendeur, BonCommandeClient } from "../../../Components/Article/Interfaces";
import classnames from "classnames";
import VenteComptoirePDFModal from "./VenteComptoirePDFModal";

const VenteComptoire = () => {
    const [detailModal, setDetailModal] = useState(false);
    const [selectedBonCommande, setSelectedBonCommande] = useState<BonCommandeClient | null>(null);
    const [taxMode, setTaxMode] = useState<"HT" | "TTC">("HT");
    const [activeTab, setActiveTab] = useState("1");
    const [modal, setModal] = useState(false);
    const [bonsCommande, setBonsCommande] = useState<BonCommandeClient[]>([]);
    const [filteredBonsCommande, setFilteredBonsCommande] = useState<BonCommandeClient[]>([]);
    const [bonCommande, setBonCommande] = useState<BonCommandeClient | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [searchText, setSearchText] = useState("");
    const [articleSearch, setArticleSearch] = useState("");
    const [clientSearch, setClientSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [showRemise, setShowRemise] = useState(false);
    const [nextNumeroCommande, setNextNumeroCommande] = useState("");
    const [remiseType, setRemiseType] = useState<"percentage" | "fixed">("percentage");
    const [globalRemise, setGlobalRemise] = useState<number>(0);
    const [selectedArticles, setSelectedArticles] = useState<{
        article_id: number;
        quantite: number;
        prixUnitaire: number;
        tva?: number | null;
        remise?: number | null;
        articleDetails?: Article;
    }[]>([]);
    const [pdfModal, setPdfModal] = useState(false);
    const [selectedBonCommandeForPdf, setSelectedBonCommandeForPdf] = useState<BonCommandeClient | null>(null);
    const [pdfType, setPdfType] = useState<"facture" | "receipt">("facture");

    const openPdfModal = (bonCommande: BonCommandeClient, type: "facture" | "receipt") => {
        setSelectedBonCommandeForPdf(bonCommande);
        setPdfType(type);
        setPdfModal(true);
    };

    const tvaOptions = [
        { value: null, label: "Non applicable" },
        { value: 0, label: "0% (Exonéré)" },
        { value: 7, label: "7%" },
        { value: 10, label: "10%" },
        { value: 13, label: "13%" },
        { value: 19, label: "19%" },
        { value: 21, label: "21%" }
    ];

    const companyInfo = {
        name: "Votre Société",
        address: "123 Rue Principale",
        city: "Tunis, Tunisie",
        phone: "+216 12 345 678",
        email: "contact@votresociete.com",
        website: "www.votresociete.com",
        taxId: "12345678/A/M/000"
    };

    const fetchNextNumber = useCallback(async () => {
        try {
            const numero = await fetchNextVenteComptoireNumber();
            setNextNumeroCommande(numero);
        } catch (err) {
            toast.error("Échec de la récupération du numéro de vente");
            const year = moment().format('YYYY');
            const defaultNumber = `VC${year}${String(bonsCommande.length + 1).padStart(5, '0')}`;
            setNextNumeroCommande(defaultNumber);
        }
    }, [bonsCommande.length]);

    useEffect(() => {
        if (modal && !isEdit) {
            fetchNextNumber();
        }
    }, [modal, isEdit, fetchNextNumber]);

    useEffect(() => {
        if (articleSearch.length >= 3) {
            const filtered = articles.filter(article =>
                article.designation.toLowerCase().includes(articleSearch.toLowerCase()) ||
                article.reference.toLowerCase().includes(articleSearch.toLowerCase())
            );
            setFilteredArticles(filtered);
        } else {
            setFilteredArticles([]);
        }
    }, [articleSearch, articles]);

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
            const [bonsData, clientsData, vendeursData, articlesData] = await Promise.all([
                fetchVenteComptoire(),
                fetchClients(),
                fetchVendeurs(),
                fetchArticles()
            ]);

            setBonsCommande(bonsData);
            setFilteredBonsCommande(bonsData);
            setClients(clientsData);
            setVendeurs(vendeursData);
            setArticles(articlesData);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Échec du chargement des données");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let result = [...bonsCommande];

        if (startDate && endDate) {
            const start = moment(startDate).startOf('day');
            const end = moment(endDate).endOf('day');
            result = result.filter(bon => {
                const bonDate = moment(bon.dateCommande);
                return bonDate.isBetween(start, end, null, '[]');
            });
        }

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            result = result.filter(bon =>
                bon.numeroCommande.toLowerCase().includes(searchLower) ||
                (bon.client?.raison_sociale && bon.client.raison_sociale.toLowerCase().includes(searchLower))
            );
        }

        setFilteredBonsCommande(result);
    }, [startDate, endDate, searchText, bonsCommande]);

    const openDetailModal = (bonCommande: BonCommandeClient) => {
        setSelectedBonCommande(bonCommande);
        setDetailModal(true);
    };

    const { subTotal, totalTax, grandTotal, finalTotal, discountAmount } = useMemo(() => {
        if (selectedArticles.length === 0) {
            return {
                subTotal: 0,
                totalTax: 0,
                grandTotal: 0,
                finalTotal: 0,
                discountAmount: 0
            };
        }
    
        let subTotalValue = 0;
        let totalTaxValue = 0;
        let grandTotalValue = 0;
    
        selectedArticles.forEach(article => {
            const qty = article.quantite || 1;
            const price = article.prixUnitaire || 0;
            const tvaRate = article.tva ?? 0;
            const remiseRate = article.remise || 0;
    
            const montantHTLigne = qty * price * (1 - (remiseRate / 100));
            const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
            const taxAmount = montantTTCLigne - montantHTLigne;
    
            subTotalValue += montantHTLigne;
            totalTaxValue += taxAmount;
            grandTotalValue += montantTTCLigne;
        });
    
        let finalTotalValue = grandTotalValue;
        let discountAmountValue = 0;
    
        if (showRemise && globalRemise > 0) {
            if (remiseType === "percentage") {
                // Pourcentage: déduire le pourcentage du grand total
                discountAmountValue = grandTotalValue * (globalRemise / 100);
                finalTotalValue = grandTotalValue - discountAmountValue;
            } else {
                // Montant fixe: le montant fixe devient le total final
                discountAmountValue = grandTotalValue - Number(globalRemise);
                finalTotalValue = Number(globalRemise);
            }
        }
    
        // Ensure all values are numbers
        return {
            subTotal: Number(subTotalValue) || 0,
            totalTax: Number(totalTaxValue) || 0,
            grandTotal: Number(grandTotalValue) || 0,
            finalTotal: Number(finalTotalValue) || 0,
            discountAmount: Number(discountAmountValue) || 0
        };
    }, [selectedArticles, globalRemise, remiseType, showRemise]);


    const handleDelete = async () => {
        if (!bonCommande) return;

        try {
            await deleteventecomptoire(bonCommande.id);
            setDeleteModal(false);
            fetchData();
            toast.success("Vente supprimée avec succès");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de la suppression");
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const venteData = {
                ...values,
                taxMode,
                client_id: selectedClient?.id,
                articles: selectedArticles.map(item => ({
                    article_id: item.article_id,
                    quantite: item.quantite,
                    prix_unitaire: item.prixUnitaire,
                    tva: item.tva,
                    remise: item.remise
                })),
                remise: globalRemise,
                remiseType: remiseType,
                totalHT: subTotal,
                totalTVA: totalTax,
                totalTTC: grandTotal,
                totalTTCAfterRemise: finalTotal
            };

            if (isEdit && bonCommande) {
                await updateventecomptoire(bonCommande.id, venteData);
                toast.success("Vente comptoire mise à jour avec succès");
            } else {
                await CreateVenteComptoire(venteData);
                toast.success("Vente comptoire créée avec succès");
            }

            setModal(false);
            fetchData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de l'opération");
        }
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            numeroCommande: isEdit ? (bonCommande?.numeroCommande || '') : nextNumeroCommande,
            dateCommande: bonCommande?.dateCommande ? moment(bonCommande.dateCommande).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
            client_id: bonCommande?.client?.id ?? '',
            vendeur_id: bonCommande?.vendeur?.id ?? '',
            notes: bonCommande?.notes ?? ''
        },
        validationSchema: Yup.object().shape({
            numeroCommande: Yup.string().required("Le numéro de vente est requis"),
            dateCommande: Yup.date().required("La date de commande est requise"),
            client_id: Yup.number().required("Le client est requis"),
            vendeur_id: Yup.number().required("Le vendeur est requis")
        }),
        onSubmit: handleSubmit
    });

    const toggleModal = useCallback(() => {
        if (modal) {
            setModal(false);
            setBonCommande(null);
            setSelectedArticles([]);
            setSelectedClient(null);
            setGlobalRemise(0);
            setRemiseType("percentage");
            setShowRemise(false);
            validation.resetForm();
        } else {
            setModal(true);
        }
    }, [modal]);

    const handleAddArticle = (articleId: string) => {
        const article = articles.find(a => a.id === parseInt(articleId));
        if (article && !selectedArticles.some(item => item.article_id === article.id)) {
            setSelectedArticles([...selectedArticles, {
                article_id: article.id,
                quantite: 0,
                prixUnitaire: article.puv_ht ,
                tva: article.tva ?? null,
                remise: 0,
                articleDetails: article
            }]);
        }
    };

    const handleRemoveArticle = (articleId: number) => {
        setSelectedArticles(selectedArticles.filter(item => item.article_id !== articleId));
    };

    const handleArticleChange = (articleId: number, field: string, value: any) => {
        setSelectedArticles(selectedArticles.map(item =>
            item.article_id === articleId ? { ...item, [field]: value } : item
        ));
    };

    const columns = useMemo(
        () => [
            {
                header: "Numéro",
                accessorKey: "numeroCommande",
                enableColumnFilter: false,
                cell: (cell: any) => (
                    <Link to="#" className="text-body fw-medium" onClick={() => openDetailModal(cell.row.original)}>
                        {cell.getValue()}
                    </Link>
                ),
            },
            {
                header: "Date",
                accessorKey: "dateCommande",
                enableColumnFilter: false,
                cell: (cell: any) => moment(cell.getValue()).format("DD MMM YYYY"),
            },
            {
                header: "Client",
                accessorKey: "client",
                enableColumnFilter: false,
                cell: (cell: any) => `${cell.getValue()?.raison_sociale || 'N/A'}`,
            },
            {
                header: "Vendeur",
                accessorKey: "vendeur",
                enableColumnFilter: false,
                cell: (cell: any) => `${cell.getValue()?.nom || ''} ${cell.getValue()?.prenom || ''}`,
            },
            {
                header: "Articles",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => (
                    <Badge color="success" className="text-uppercase">
                        {cell.getValue().length} articles
                    </Badge>
                ),
            },
            {
                header: "Total TTC",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const total = cell.getValue().reduce((sum: number, item: any) => {
                        const qty = Number(item.quantite) || 1;
                        const price = Number(item.prixUnitaire) || 0;
                        const tvaRate = Number(item.tva ?? 0);
                        const remiseRate = Number(item.remise || 0);
            
                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
                        
                        return sum + montantTTCLigne;
                    }, 0);
                    return `${total.toFixed(3)} DT`;
                },
            },
            {
                header: "Total Après Remise",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const total = cell.getValue().reduce((sum: number, item: any) => {
                        const qty = Number(item.quantite) || 1;
                        const price = Number(item.prixUnitaire) || 0;
                        const tvaRate = Number(item.tva ?? 0);
                        const remiseRate = Number(item.remise || 0);
            
                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
                        
                        return sum + montantTTCLigne;
                    }, 0);
            
                    const globalDiscount = Number(cell.row.original.remise) || 0;
                    const discountType = cell.row.original.remiseType || "percentage";
            
                    let netAPayer = total;
                    if (globalDiscount > 0) {
                        if (discountType === "percentage") {
                            netAPayer = total * (1 - globalDiscount / 100);
                        } else {
                            netAPayer = globalDiscount;
                        }
                    }
            
                    return `${netAPayer.toFixed(3)} DT`;
                },
            },
            {
                header: "Action",
                cell: (cellProps: any) => {
                    const bonCommande = cellProps.row.original;
                    return (
                        <ul className="list-inline hstack gap-2 mb-0">
                            <li className="list-inline-item">
                                <Link
                                    to="#"
                                    className="text-info d-inline-block"
                                    onClick={() => openDetailModal(bonCommande)}
                                >
                                    <i className="ri-eye-line fs-16"></i>
                                </Link>
                            </li>
                            <li className="list-inline-item">
                                <Link
                                    to="#"
                                    className="text-info d-inline-block"
                                    onClick={() => openPdfModal(bonCommande, "facture")}
                                >
                                    <i className="ri-file-pdf-line fs-16"></i>
                                </Link>
                            </li>
                            <li className="list-inline-item">
                                <Link
                                    to="#"
                                    className="text-info d-inline-block"
                                    onClick={() => openPdfModal(bonCommande, "receipt")}
                                >
                                    <i className="ri-printer-line fs-16"></i>
                                </Link>
                            </li>
                            <li className="list-inline-item edit">
                                <Link
                                    to="#"
                                    className="text-primary d-inline-block edit-item-btn"
                                    onClick={() => {
                                        setBonCommande(bonCommande);
                                        setSelectedClient(bonCommande.client);
                                        setSelectedArticles(bonCommande.articles.map((item: any) => ({
                                            article_id: item.article.id,
                                            quantite: item.quantite,
                                            prixUnitaire: Number(item.prixUnitaire),
                                            tva: item.tva != null ? Number(item.tva) : null,
                                            remise: item.remise != null ? Number(item.remise) : null,
                                            articleDetails: item.article
                                        })));
                                        setGlobalRemise(bonCommande.remise || 0);
                                        setRemiseType(bonCommande.remiseType || "percentage");
                                        setShowRemise(!!bonCommande.remise && bonCommande.remise > 0);
                                        setIsEdit(true);
                                        setModal(true);
                                    }}
                                >
                                    <i className="ri-pencil-fill fs-16"></i>
                                </Link>
                            </li>
                            <li className="list-inline-item">
                                <Link
                                    to="#"
                                    className="text-danger d-inline-block remove-item-btn"
                                    onClick={() => {
                                        setBonCommande(bonCommande);
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
        []
    );

    return (
        <div className="page-content">
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDelete}
                onCloseClick={() => setDeleteModal(false)}
            />

            <Container fluid>
                <BreadCrumb title="Vente Comptoire" pageTitle="Commandes" />

                <Row>
                    <Col lg={12}>
                        <Card id="bonCommandeList">
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="card-title mb-0">Gestion des Ventes Comptoire</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <div className="d-flex gap-1 flex-wrap">
                                            <Button
                                                color="secondary"
                                                onClick={() => {
                                                    setIsEdit(false);
                                                    setBonCommande(null);
                                                    setSelectedArticles([]);
                                                    setSelectedClient(null);
                                                    setGlobalRemise(0);
                                                    setRemiseType("percentage");
                                                    setShowRemise(false);
                                                    validation.resetForm();
                                                    toggleModal();
                                                }}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i> Ajouter Vente Comptoire
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
                                        data={filteredBonsCommande}
                                        isGlobalFilter={false}
                                        customPageSize={10}
                                        divClass="table-responsive table-card mb-1 mt-0"
                                        tableClass="align-middle table-nowrap"
                                        theadClass="table-light text-muted text-uppercase"
                                    />
                                )}

                                <Modal isOpen={detailModal} toggle={() => setDetailModal(false)} size="lg" centered>
                                    <ModalHeader toggle={() => setDetailModal(false)} className="border-0 pb-2">
                                        <div className="d-flex justify-content-between align-items-center w-100">
                                            <div>
                                                <h5 className="mb-1">Vente Comptoire #{selectedBonCommande?.numeroCommande}</h5>
                                                <small className="text-muted">
                                                    {moment(selectedBonCommande?.dateCommande).format("DD MMM YYYY")}
                                                </small>
                                            </div>
                                        </div>
                                    </ModalHeader>

                                    <ModalBody className="pt-0">
                                        {selectedBonCommande && (
                                            <div className="bon-livraison-details">
                                                <Row className="g-3 mb-3">
                                                    <Col md={6}>
                                                        <Card className="border">
                                                            <CardBody className="p-3">
                                                                <h6 className="text-uppercase text-muted fs-12 mb-3">Client</h6>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-grow-1">
                                                                        <h5 className="mb-1">{selectedBonCommande.client?.raison_sociale}</h5>
                                                                        <p className="text-muted mb-1 small">
                                                                            <i className="ri-phone-line me-1"></i>
                                                                            {selectedBonCommande.client?.telephone1}
                                                                        </p>
                                                                        <p className="text-muted mb-0 small">
                                                                            <i className="ri-map-pin-line me-1"></i>
                                                                            {selectedBonCommande.client?.adresse}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Card className="border">
                                                            <CardBody className="p-3">
                                                                <h6 className="text-uppercase text-muted fs-12 mb-3">Informations</h6>
                                                                <div className="row g-2">
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small">
                                                                            <span className="text-muted">Vendeur:</span><br />
                                                                            {selectedBonCommande.vendeur?.nom} {selectedBonCommande.vendeur?.prenom}
                                                                        </p>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small">
                                                                            <span className="text-muted">Commande:</span><br />
                                                                            {selectedBonCommande?.numeroCommande || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                </Row>

                                                {selectedBonCommande.notes && (
                                                    <Card className="border mb-3">
                                                        <CardBody className="p-3">
                                                            <h6 className="text-uppercase text-muted fs-12 mb-2">Notes</h6>
                                                            <p className="mb-0">{selectedBonCommande.notes}</p>
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                <Card className="border">
                                                    <CardBody className="p-0">
                                                        <div className="table-responsive">
                                                            <Table className="table-borderless mb-0">
                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th className="ps-3">Article</th>
                                                                        <th>Référence</th>
                                                                        <th className="text-end">Quantité</th>
                                                                        <th className="text-end">Prix Unitaire</th>
                                                                        <th className="text-end">TVA (%)</th>
                                                                        <th className="text-end">Remise (%)</th>
                                                                        <th className="text-end">Total HT</th>
                                                                        <th className="text-end pe-3">Total TTC</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {selectedBonCommande.articles.map((item, index) => {
                                                                        const qty = Number(item.quantite) || 1;
                                                                        const price = Number(item.prixUnitaire) || 0;
                                                                        const tvaRate = Number(item.tva ?? 0);
                                                                        const remiseRate = Number(item.remise || 0);

                                                                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                                                                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));

                                                                        return (
                                                                            <tr key={index} className={index % 2 === 0 ? "bg-light" : ""}>
                                                                                <td className="ps-3">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className="flex-grow-1">
                                                                                            <h6 className="mb-0 fs-14">{item.article?.nom}</h6>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    <span className="text-muted">{item.article?.reference || '-'}</span>
                                                                                </td>
                                                                                <td className="text-end">{qty}</td>
                                                                                <td className="text-end">{price.toFixed(2)}</td>
                                                                                <td className="text-end">{tvaRate}</td>
                                                                                <td className="text-end">{remiseRate}</td>
                                                                                <td className="text-end">{montantHTLigne.toFixed(2)} DT</td>
                                                                                <td className="text-end pe-3 fw-medium">{montantTTCLigne.toFixed(2)} DT</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </Table>
                                                        </div>

                                                        <div className="border-top p-3">
    <Row className="justify-content-end">
        <Col xs={8} sm={6} md={5} lg={4}>
            {(() => {
                let subTotalValue = 0;
                let totalTaxValue = 0;
                let grandTotalValue = 0;

                selectedBonCommande.articles.forEach(item => {
                    const qty = Number(item.quantite) || 1;
                    const price = Number(item.prixUnitaire) || 0;
                    const tvaRate = Number(item.tva ?? 0);
                    const remiseRate = Number(item.remise || 0);

                    const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                    const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
                    const taxAmount = montantTTCLigne - montantHTLigne;

                    subTotalValue += montantHTLigne;
                    totalTaxValue += taxAmount;
                    grandTotalValue += montantTTCLigne;
                });

                const remiseValue = Number(selectedBonCommande.remise) || 0;
                const remiseTypeValue = selectedBonCommande.remiseType || "percentage";
                let discountAmount = 0;
                let finalTotal = grandTotalValue;

                if (remiseValue > 0) {
                    if (remiseTypeValue === "percentage") {
                        discountAmount = grandTotalValue * (remiseValue / 100);
                        finalTotal = grandTotalValue * (1 - (remiseValue / 100));
                    } else {
                        discountAmount = grandTotalValue - Number(remiseValue);
                        finalTotal = Number(remiseValue);
                    }
                }

                return (
                    <Table className="table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <th className="text-end">Sous-total HT:</th>
                                <td className="text-end">{subTotalValue.toFixed(3)} DT</td>
                            </tr>
                            <tr>
                                <th className="text-end">TVA:</th>
                                <td className="text-end">{totalTaxValue.toFixed(3)} DT</td>
                            </tr>
                            <tr>
                                <th className="text-end">Total TTC:</th>
                                <td className="text-end">{grandTotalValue.toFixed(3)} DT</td>
                            </tr>
                            {remiseValue > 0 && (
                                <tr>
                                    <th className="text-end">
                                        {remiseTypeValue === "percentage" ? `Remise (${remiseValue}%)` : "Remise (Montant fixe)"}
                                    </th>
                                    <td className="text-end text-danger">
                                        - {discountAmount.toFixed(3)} DT
                                    </td>
                                </tr>
                            )}
                            {remiseValue > 0 && (
                                <tr className="border-top">
                                    <th className="text-end">Total Après Remise:</th>
                                    <td className="text-end fw-bold">{finalTotal.toFixed(3)} DT</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                );
            })()}
        </Col>
    </Row>
</div>
                                                    </CardBody>
                                                </Card>
                                            </div>
                                        )}
                                    </ModalBody>

                                    <ModalFooter>
                                        {selectedBonCommande && (
                                            <>
                                                <Button
                                                    color="primary"
                                                    size="md"
                                                    onClick={() => openPdfModal(selectedBonCommande, "facture")}
                                                    className="me-2"
                                                >
                                                    <i className="ri-file-pdf-line me-1"></i> Imprimer Facture
                                                </Button>
                                                <Button
                                                    color="info"
                                                    size="md"
                                                    onClick={() => openPdfModal(selectedBonCommande, "receipt")}
                                                    className="me-2"
                                                >
                                                    <i className="ri-printer-line me-1"></i> Imprimer Reçu
                                                </Button>
                                            </>
                                        )}
                                        <Button color="secondary" onClick={() => setDetailModal(false)}>
                                            Fermer
                                        </Button>
                                    </ModalFooter>
                                </Modal>

                                <Modal isOpen={modal} toggle={toggleModal} centered size="lg">
                                    <ModalHeader toggle={toggleModal}>
                                        {isEdit ? "Modifier Vente Comptoire" : "Ajouter Vente Comptoire"}
                                    </ModalHeader>
                                    <Form onSubmit={validation.handleSubmit}>
                                        <ModalBody style={{ padding: '20px' }}>
                                            <Row>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Numéro de Vente*</Label>
                                                        <Input
                                                            name="numeroCommande"
                                                            value={validation.values.numeroCommande}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.numeroCommande && !!validation.errors.numeroCommande}
                                                            readOnly={isEdit}
                                                        />
                                                        <FormFeedback>{validation.errors.numeroCommande}</FormFeedback>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Date de commande*</Label>
                                                        <Input
                                                            className="form-control"
                                                            type="date"
                                                            name="dateCommande"
                                                            value={validation.values.dateCommande}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.dateCommande && !!validation.errors.dateCommande}
                                                        />
                                                       { validation.touched.dateCommande && !!validation.errors.dateCommande }
                                                    </div>
                                                </Col>
                                             
                                            </Row>

                                            <Row>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <Label>Client*</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Rechercher client (min 3 caractères)"
                                                            value={selectedClient ? selectedClient.raison_sociale : clientSearch}
                                                            onChange={(e) => {
                                                                if (!e.target.value) {
                                                                    setSelectedClient(null);
                                                                    validation.setFieldValue("client_id", "");
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
                                                                                    setClientSearch("");
                                                                                    setFilteredClients([]);
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
                                                                    validation.setFieldValue("client_id", "");
                                                                    setClientSearch("");
                                                                }}
                                                            >
                                                                <i className="ri-close-line"></i> Changer de client
                                                            </Button>
                                                        )}
                                                        {validation.touched.client_id && validation.errors.client_id && (
                                                            <div className="text-danger">{validation.errors.client_id}</div>
                                                        )}
                                                    </div>
                                                </Col>

                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <Label>Vendeur*</Label>
                                                        <Input
                                                            type="select"
                                                            name="vendeur_id"
                                                            value={validation.values.vendeur_id}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.vendeur_id && !!validation.errors.vendeur_id}
                                                        >
                                                            <option value="">Sélectionner un vendeur</option>
                                                            {vendeurs.map(vendeur => (
                                                                <option key={vendeur.id} value={vendeur.id}>
                                                                    {vendeur.nom} {vendeur.prenom}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        <FormFeedback>{validation.errors.vendeur_id}</FormFeedback>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={12}>
                                                    <div className="mb-3">
                                                        <Label>Notes</Label>
                                                        <Input
                                                            type="textarea"
                                                            name="notes"
                                                            value={validation.values.notes}
                                                            onChange={validation.handleChange}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className="mt-3">
                                                <Col md={12}>
                                                    <h5>Remise Globale</h5>
                                                    <Row>
                                                        <Col md={3}>
                                                            <FormGroup check>
                                                                <Input
                                                                    type="checkbox"
                                                                    id="showRemise"
                                                                    checked={showRemise}
                                                                    onChange={(e) => {
                                                                        setShowRemise(e.target.checked);
                                                                        if (!e.target.checked) {
                                                                            setGlobalRemise(0);
                                                                        }
                                                                    }}
                                                                />
                                                                <Label for="showRemise" check>
                                                                    Appliquer une remise
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                        {showRemise && (
                                                            <>
                                                                <Col md={3}>
                                                                    <div className="mb-3">
                                                                        <Label>Type de remise</Label>
                                                                        <Input
                                                                            type="select"
                                                                            value={remiseType}
                                                                            onChange={(e) => setRemiseType(e.target.value as "percentage" | "fixed")}
                                                                        >
                                                                            <option value="percentage">Pourcentage</option>
                                                                            <option value="fixed">Montant fixe (DT)</option>
                                                                        </Input>
                                                                    </div>
                                                                </Col>
                                                                <Col md={3}>
                                                                    <div className="mb-3">
                                                                        <Label>
                                                                            {remiseType === "percentage" ? "Pourcentage de remise" : "Montant de remise (DT)"}
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={globalRemise}
                                                                            onChange={(e) => setGlobalRemise(Number(e.target.value) || 0)}
                                                                            placeholder={remiseType === "percentage" ? "0-100%" : "Montant en DT"}
                                                                        />
                                                                    </div>
                                                                </Col>
                                                            </>
                                                        )}
                                                    </Row>
                                                </Col>
                                            </Row>

                                            <Row className="mt-3">
                                                <Col md={12}>
                                                    <h5>Articles</h5>
                                                    <div className="mb-3">
                                                        <Input
                                                            type="text"
                                                            placeholder="Rechercher article (min 3 caractères)"
                                                            value={articleSearch}
                                                            onChange={(e) => setArticleSearch(e.target.value)}
                                                        />
                                                        {articleSearch.length >= 3 && (
                                                            <div className="search-results mt-2">
                                                                {filteredArticles.length > 0 ? (
                                                                    <ul className="list-group">
                                                                        {filteredArticles.map(article => (
                                                                            <li
                                                                                key={article.id}
                                                                                className="list-group-item list-group-item-action"
                                                                                onClick={() => {
                                                                                    handleAddArticle(article.id.toString());
                                                                                    setArticleSearch("");
                                                                                    setFilteredArticles([]);
                                                                                }}
                                                                            >
                                                                                {article.reference} - {article.designation} (Stock: {article.qte})
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="text-muted">Aucun résultat trouvé</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>

                                            {selectedArticles.length > 0 && (
                                                <>
                                                    <div className="table-responsive">
                                                        <Table className="table table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th>Article</th>
                                                                    <th>Référence</th>
                                                                    <th>Quantité</th>
                                                                    <th>Prix Unitaire</th>
                                                                    <th>TVA (%)</th>
                                                                    <th>Remise (%)</th>
                                                                    <th>Total HT</th>
                                                                    <th>Total TTC</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedArticles.map((item, index) => {
                                                                    const article = articles.find(a => a.id === item.article_id) || item.articleDetails;
                                                                    const qty = item.quantite || 1;
                                                                    const price = item.prixUnitaire || 0;
                                                                    const tvaRate = item.tva ?? 0;
                                                                    const remiseRate = item.remise || 0;

                                                                    const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                                                                    const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));

                                                                    return (
                                                                        <tr key={`${item.article_id}-${index}`}>
                                                                            <td>{article?.designation}</td>
                                                                            <td>{article?.reference}</td>
                                                                            <td width="100px">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={item.quantite}
                                                                                    onChange={(e) => handleArticleChange(item.article_id, 'quantite', Number(e.target.value))}
                                                                                />
                                                                            </td>
                                                                            <td width="120px">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    value={item.prixUnitaire}
                                                                                    onChange={(e) => handleArticleChange(item.article_id, 'prixUnitaire', Number(e.target.value))}
                                                                                />
                                                                            </td>
                                                                            <td width="100px">
                                                                                <Input
                                                                                    type="select"
                                                                                    value={item.tva ?? ''}
                                                                                    onChange={(e) => handleArticleChange(
                                                                                        item.article_id,
                                                                                        'tva',
                                                                                        e.target.value === '' ? null : Number(e.target.value)
                                                                                    )}
                                                                                >
                                                                                    <option value="">Sélectionner TVA</option>
                                                                                    {tvaOptions.map(option => (
                                                                                        <option key={option.value ?? 'null'} value={option.value ?? ''}>
                                                                                            {option.label}
                                                                                        </option>
                                                                                    ))}
                                                                                </Input>
                                                                            </td>
                                                                            <td width="100px">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    value={item.remise ?? 0}
                                                                                    onChange={(e) => handleArticleChange(item.article_id, 'remise', Number(e.target.value))}
                                                                                />
                                                                            </td>
                                                                            <td>{montantHTLigne.toFixed(2)} DT</td>
                                                                            <td>{montantTTCLigne.toFixed(2)} DT</td>
                                                                            <td>
                                                                                <Button
                                                                                    color="danger"
                                                                                    size="sm"
                                                                                    onClick={() => handleRemoveArticle(item.article_id)}
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

                                                    <Row className="mt-3 justify-content-end">
    <Col xs={8} sm={6} md={5} lg={4}>
        <Table className="table-sm table-borderless mb-0">
            <tbody>
                <tr>
                    <th className="text-end">Sous-total HT:</th>
                    <td className="text-end">{subTotal.toFixed(3)} DT</td>
                </tr>
                <tr>
                    <th className="text-end">TVA:</th>
                    <td className="text-end">{totalTax.toFixed(3)} DT</td>
                </tr>
                <tr>
                    <th className="text-end">Total TTC:</th>
                    <td className="text-end">{grandTotal.toFixed(3)} DT</td>
                </tr>
                {showRemise && globalRemise > 0 && (
                    <tr>
                        <th className="text-end">
                            {remiseType === "percentage" ? `Remise (${globalRemise}%)` : "Remise (Montant fixe)"}
                        </th>
                        <td className="text-end text-danger">
                            - {Number(discountAmount).toFixed(3)} DT
                        </td>
                    </tr>
                )}
                {showRemise && globalRemise > 0 && (
                    <tr className="border-top">
                        <th className="text-end">Total Après Remise:</th>
                        <td className="text-end fw-bold">{finalTotal.toFixed(3)} DT</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </Col>
</Row> 

                                                </>
                                            )}
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="light" onClick={toggleModal}>
                                                <i className="ri-close-line align-bottom me-1"></i> Annuler
                                            </Button>
                                            <Button
                                                color="primary"
                                                type="submit"
                                                disabled={selectedArticles.length === 0 || !selectedClient}
                                            >
                                                <i className="ri-save-line align-bottom me-1"></i> {isEdit ? "Modifier" : "Enregistrer"}
                                            </Button>
                                        </ModalFooter>
                                    </Form>
                                </Modal>

                                <VenteComptoirePDFModal
                                    isOpen={pdfModal}
                                    toggle={() => setPdfModal(false)}
                                    bonCommande={selectedBonCommandeForPdf}
                                    companyInfo={companyInfo}
                                    pdfType={pdfType}
                                />

                                <ToastContainer />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default VenteComptoire;